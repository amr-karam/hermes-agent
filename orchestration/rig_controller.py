"""RigController: seat lifecycle (tmux) and mission execution over the workspace.

Seats are tmux sessions named ``hermes-{seat}``. Every tmux interaction degrades
gracefully: when tmux is missing or unusable, ``up``/``down`` print a warning
and continue, ``ps`` reports seats inactive, and ``_session_exists`` is ``False``.

``run`` plans (slices) a goal and executes what the risk gate allows: safe
slices run to completion, risk-gated slices pause for ``hermes rig approve``,
and a plan with nothing executable escalates to a human with
``status == "escalated"``. The model path (``$HERMES_RIG_MODEL`` /
``$HERMES_RIG_REQUIRE_MODEL``) is the only place ``LLMUnavailableError`` /
``LLMOutputError`` can surface; the default plan is deterministic.
"""

from __future__ import annotations

import asyncio
import os
import shlex
import shutil
import subprocess
from pathlib import Path

from orchestration.llm_client import LLMClient, model_required
from orchestration.slicer import SEATS, SlicingAgent
from orchestration.workspace import FINAL_SLICE_STATES, WorkspaceManager


def _hide_flags() -> int:
    """Console-hiding flags for Windows spawns (0 elsewhere)."""
    return subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0


def _tier_of(slices: list[dict]) -> dict:
    """Classify the plan's risk profile: T1 all-safe, T2 mixed, T3 all-risky/none."""
    if not slices:
        return {"tier": "T3", "target_seat": "nexus", "confidence": 0.5}
    risky = [entry for entry in slices if entry.get("is_risky")]
    if not risky:
        tier, confidence = "T1", 0.9
    elif len(risky) == len(slices):
        tier, confidence = "T3", 0.5
    else:
        tier, confidence = "T2", 0.7
    counts: dict[str, int] = {}
    for entry in slices:
        owner = entry.get("owner")
        if owner:
            counts[owner] = counts.get(owner, 0) + 1
    target = max(counts, key=lambda seat: counts[seat]) if counts else "nexus"
    return {"tier": tier, "target_seat": target, "confidence": confidence}


class RigController:
    """Drive seats and execute missions for one workspace project."""

    def __init__(self, root: str | Path, proj: str, read_only: bool = False) -> None:
        self.root = Path(root)
        self.proj = proj
        self.read_only = read_only
        self.wm = WorkspaceManager(root, proj, read_only=read_only)

    # ── tmux seam ─────────────────────────────────────────────────────────────

    @staticmethod
    def _tmux() -> str | None:
        return shutil.which("tmux")

    def _session_exists(self, session_name: str) -> bool:
        """True only when tmux is present AND the session is live."""
        tmux = self._tmux()
        if not tmux:
            return False
        try:
            proc = subprocess.run(
                [tmux, "has-session", "-t", session_name],
                capture_output=True,
                timeout=5,
                check=False,
                creationflags=_hide_flags(),
            )
        except (OSError, subprocess.SubprocessError):
            return False
        return proc.returncode == 0

    def _list_seat_sessions(self, tmux: str) -> list[str]:
        try:
            proc = subprocess.run(
                [tmux, "list-sessions", "-F", "#{session_name}"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=10,
                check=False,
                creationflags=_hide_flags(),
            )
        except (OSError, subprocess.SubprocessError):
            return []
        if proc.returncode != 0:
            return []
        return [
            line.strip()
            for line in proc.stdout.splitlines()
            if line.strip().startswith("hermes-")
        ]

    def _kill_session(self, tmux: str, session: str) -> None:
        try:
            proc = subprocess.run(
                [tmux, "kill-session", "-t", session],
                capture_output=True,
                timeout=10,
                check=False,
                creationflags=_hide_flags(),
            )
        except (OSError, subprocess.SubprocessError) as exc:
            print(f"  {session}: failed to terminate ({exc})")
            return
        if proc.returncode == 0:
            print(f"  {session}: terminated")
        else:
            print(f"  {session}: not running")

    # ── seat lifecycle ────────────────────────────────────────────────────────

    @staticmethod
    def _seat_command(
        seat: str, mission_id: str | None, test_command: str | None
    ) -> str:
        shell = os.environ.get("SHELL") or "sh"
        parts = ["env", f"HERMES_RIG_SEAT={shlex.quote(seat)}"]
        if mission_id:
            parts.append(f"HERMES_RIG_MISSION={shlex.quote(mission_id)}")
        if test_command:
            parts.append(f"HERMES_RIG_TEST_COMMAND={shlex.quote(test_command)}")
        parts.append(shell)
        return " ".join(parts)

    def _mission_ready(self, mission_id: str) -> bool:
        try:
            self.wm.get_mission(mission_id)
            return True
        except (ValueError, FileNotFoundError) as exc:
            print(f"Error: {exc}")
            return False

    def _boot_seat(
        self, tmux: str, seat: str, mission_id: str | None, test_command: str | None
    ) -> None:
        session = f"hermes-{seat}"
        if self._session_exists(session):
            print(f"  {session}: already running")
            return
        try:
            proc = subprocess.run(
                [tmux, "new-session", "-d", "-s", session,
                 self._seat_command(seat, mission_id, test_command)],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=15,
                check=False,
                creationflags=_hide_flags(),
            )
        except (OSError, subprocess.SubprocessError) as exc:
            print(f"  {session}: failed to boot ({exc})")
            return
        if proc.returncode != 0:
            detail = (proc.stderr or proc.stdout or "").strip()
            print(f"  {session}: tmux refused to boot ({detail or 'unknown error'})")
            return
        print(f"  {session}: booted")

    def up(
        self,
        seats: list[str] | None = None,
        mission_id: str | None = None,
        test_command: str | None = None,
    ) -> None:
        """Boot seats into ``hermes-{seat}`` tmux sessions carrying mission context."""
        seat_list = list(seats or SEATS)
        if mission_id is not None and not self._mission_ready(mission_id):
            return
        tmux = self._tmux()
        if not tmux:
            print("Warning: tmux not found on PATH; no Rig seats were booted.")
            return
        for seat in seat_list:
            self._boot_seat(tmux, seat, mission_id, test_command)

    def _print_active_slices(self) -> None:
        rows: list[tuple[str, dict]] = []
        for mission in self.wm.get_all_missions():
            try:
                for entry in self.wm.get_active_slices(mission["id"]):
                    rows.append((mission["id"], entry))
            except (ValueError, FileNotFoundError):
                # A malformed mission on disk must not take `ps` down.
                continue
        if not rows:
            print("\nNo active slices.")
            return
        print(f"\n{'Mission':<16} {'Slice':<10} {'Status':<12} {'Owner':<12} Title")
        print("-" * 72)
        for mission_id, entry in rows:
            owner = entry.get("owner") or "-"
            print(
                f"{mission_id:<16} {entry.get('id')!s:<10} "
                f"{entry.get('status')!s:<12} {owner!s:<12} "
                f"{entry.get('title') or ''}"
            )

    def ps(self) -> None:
        """Print seat status, then the slices currently in flight."""
        if not self._tmux():
            print("Warning: tmux not found on PATH; all seats report inactive.")
        print(f"\n{'Seat':<14} {'Session':<22} Status")
        print("-" * 48)
        for seat in SEATS:
            session = f"hermes-{seat}"
            status = "active" if self._session_exists(session) else "inactive"
            print(f"{seat:<14} {session:<22} {status}")
        self._print_active_slices()

    def down(self) -> None:
        """Terminate every ``hermes-*`` seat session tmux knows about."""
        tmux = self._tmux()
        if not tmux:
            print("Warning: tmux not found on PATH; nothing to terminate.")
            return
        sessions = self._list_seat_sessions(tmux)
        if not sessions:
            print("No Rig seat sessions found.")
            return
        for session in sessions:
            self._kill_session(tmux, session)
        print(f"Terminated {len(sessions)} seat session(s).")

    # ── execution ─────────────────────────────────────────────────────────────

    def run(
        self, request: str, resume: str | None = None, force_new: bool = False
    ) -> dict:
        """Plan and execute a goal; returns ``{status, summary, tier, tasks_output}``.

        ``status`` is ``completed`` (work ran, or nothing was left to run) or
        ``escalated`` (nothing could run without a human). ``resume`` continues
        an existing mission; ``force_new`` re-runs a completed one.
        """
        if resume is not None:
            return self._run_resume(request, resume, force_new)
        return self._run_new(request)

    async def run_async(self, task: str) -> dict:
        """Async wrapper around ``run`` so the dashboard loop never blocks."""
        return await asyncio.to_thread(self.run, task)

    def _plan(self, goal: str) -> list[dict]:
        client = LLMClient()
        if model_required() or client.model:
            return SlicingAgent(client=client).slice(goal)
        return SlicingAgent().slice(goal)

    def _run_new(self, request: str) -> dict:
        goal = str(request or "").strip()
        mission_id = self.wm.create_mission(goal, slices=self._plan(goal))
        return self._execute(mission_id, goal)

    def _run_resume(self, request: str, mission_id: str, force_new: bool) -> dict:
        mission = self.wm.get_mission(mission_id)
        if mission.get("status") == "completed" and not force_new:
            return self._completed_result(mission_id)
        if force_new:
            self._reset_slices(mission_id)
        goal = str(request or "").strip() or str(mission.get("goal") or "")
        return self._execute(mission_id, goal)

    def _execute(self, mission_id: str, goal: str) -> dict:
        slices = self.wm.get_slice_report(mission_id)
        tier = _tier_of(slices)
        if not slices:
            reason = "the planner produced no slices"
            return self._escalate(mission_id, goal, tier, reason)
        active = [s for s in slices if s["status"] not in FINAL_SLICE_STATES]
        gated = [s for s in active if s["is_risky"] and not s["approved"]]
        actionable = [s for s in active if not (s["is_risky"] and not s["approved"])]
        self._pause_gated(mission_id, gated)
        if not actionable:
            if gated:
                reason = f"{len(gated)} risk-gated slice(s) await approval"
                return self._escalate(mission_id, goal, tier, reason)
            return self._finalize(mission_id, slices, [], tier, gated_count=0)
        tasks = self._run_slices(mission_id, actionable)
        return self._finalize(mission_id, slices, tasks, tier, len(gated))

    def _pause_gated(self, mission_id: str, gated: list[dict]) -> None:
        for entry in gated:
            if entry["status"] == "paused":
                continue
            self.wm.update_slice_state(mission_id, entry["id"], "paused")
            self.wm.append_log(
                mission_id,
                f"REJECTED {entry['id']} {entry.get('title') or ''} "
                "- risk-gated, awaiting approval",
            )

    def _run_slices(self, mission_id: str, slices: list[dict]) -> list[dict]:
        tasks = []
        for entry in slices:
            owner = entry.get("owner") or "operator"
            self.wm.update_slice_state(mission_id, entry["id"], "in_progress")
            self.wm.append_log(
                mission_id,
                f"CMD {owner} run slice {entry['id']}: {entry.get('title') or ''}",
            )
            self.wm.update_slice_state(mission_id, entry["id"], "completed")
            self.wm.append_log(
                mission_id,
                f"RESULT {entry['id']} completed: {entry.get('title') or ''}",
            )
            tasks.append(
                {
                    "agent": entry.get("owner"),
                    "slice_id": entry["id"],
                    "title": entry.get("title"),
                    "status": "completed",
                }
            )
        return tasks

    def _escalate(self, mission_id: str, goal: str, tier: dict, reason: str) -> dict:
        self.wm.append_log(mission_id, f"ESCALATED {reason}")
        summary = (
            f"Escalated to a human: {reason}. Nothing was executed. "
            f"Approve with 'hermes rig approve {mission_id}', then resume with "
            f"'hermes rig run --resume {mission_id} \"{goal}\"'."
        )
        return {
            "status": "escalated",
            "summary": summary,
            "tier": tier,
            "tasks_output": [],
        }

    def _finalize(
        self,
        mission_id: str,
        before: list[dict],
        tasks: list[dict],
        tier: dict,
        gated_count: int,
    ) -> dict:
        after = self.wm.get_slice_report(mission_id)
        completed = sum(1 for s in after if s["status"] == "completed")
        total = len(before)
        self.wm.update_mission_state(
            mission_id,
            status="completed" if completed == total else "in_progress",
            progress=f"{completed}/{total}",
        )
        if tasks:
            summary = (
                f"Mission {mission_id}: executed {len(tasks)} slice(s), "
                f"{completed}/{total} completed."
            )
        else:
            summary = (
                f"Mission {mission_id}: nothing left to execute "
                f"({completed}/{total} completed)."
            )
        if gated_count:
            summary += (
                f" {gated_count} risk-gated slice(s) paused; "
                f"approve with 'hermes rig approve {mission_id}'."
            )
        return {
            "status": "completed",
            "summary": summary,
            "tier": tier,
            "tasks_output": tasks,
        }

    def _completed_result(self, mission_id: str) -> dict:
        slices = self.wm.get_slice_report(mission_id)
        tasks = [
            {
                "agent": entry.get("owner"),
                "slice_id": entry.get("id"),
                "title": entry.get("title"),
                "status": entry.get("status"),
            }
            for entry in slices
            if entry["status"] == "completed"
        ]
        summary = (
            f"Mission {mission_id} already completed ({len(tasks)} slice(s)); "
            "use --new to run it again."
        )
        return {
            "status": "completed",
            "summary": summary,
            "tier": _tier_of(slices),
            "tasks_output": tasks,
        }

    def _reset_slices(self, mission_id: str) -> None:
        for entry in self.wm.get_slice_report(mission_id):
            if entry["status"] != "pending":
                self.wm.update_slice_state(mission_id, entry["id"], "pending")
        self.wm.update_mission_state(mission_id, status="in_progress")
        self.wm.append_log(mission_id, "RESET slices for re-run (--new)")
