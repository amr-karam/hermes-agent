"""File-based durable workspace for Rig missions.

Layout (per DESIGN.md)::

    <root>/hermes-rig-workspaces/<proj>/
      missions/<mission_id>/
        SPEC.md      mission goal/spec
        state.json   {id, status, progress, goal, created_at}
        slices.json  [{id, title, owner, status, is_risky, approved, created_at}]
        log.jsonl    {"ts", "event"} lines

Reads are safe against a missing or malformed workspace (``get_all_missions``
returns ``[]``); scoped reads raise ``FileNotFoundError``/``ValueError`` so the
CLI can report them. Writes are refused on a ``read_only`` manager, which is
what the dashboard GET routes construct so a read never creates a workspace.
"""

from __future__ import annotations

import json
import re
import secrets
from datetime import datetime, timezone, UTC
from pathlib import Path
from typing import Any

#: Workspace directory name under the project root.
WORKSPACES_DIR = "hermes-rig-workspaces"

#: Slice states that end a slice; everything else counts as active/in flight.
FINAL_SLICE_STATES = frozenset({"completed", "failed"})

#: States a slice may be moved to via ``update_slice_state``.
SLICE_STATES = frozenset({"pending", "in_progress", "paused", "completed", "failed"})

#: Mission ids are minted ``rig-YYYYMMDD-<6 hex>``; the charset also keeps a
#: caller-supplied id from escaping the missions directory (no separators).
_MISSION_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _write_json(path: Path, data: Any) -> None:
    """Write JSON via a sibling temp file so a crash never leaves a torn file."""
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    tmp.replace(path)


def _read_json(path: Path) -> Any:
    """Read a JSON file; missing file raises FileNotFoundError, bad JSON ValueError."""
    return json.loads(path.read_text(encoding="utf-8"))


def _normalize_slices(slices: list[dict] | None, created_at: str) -> list[dict]:
    normalized = []
    for index, raw in enumerate(slices or []):
        if not isinstance(raw, dict) or not raw.get("id"):
            raise ValueError(f"slice #{index} must be a dict with an 'id'")
        normalized.append({**raw, "created_at": created_at})
    return normalized


class WorkspaceManager:
    """Read and mutate one project's mission workspace on disk."""

    def __init__(self, root: str | Path, proj: str, read_only: bool = False) -> None:
        self.root = Path(root)
        self.proj = proj
        self.read_only = read_only
        self.missions_dir = self.root / WORKSPACES_DIR / proj / "missions"
        if not read_only:
            self.missions_dir.mkdir(parents=True, exist_ok=True)

    # ── plumbing ──────────────────────────────────────────────────────────────

    def _mission_dir(self, mission_id: str) -> Path:
        mid = str(mission_id or "").strip()
        if not _MISSION_ID_RE.match(mid):
            raise ValueError(f"invalid mission id: {mission_id!r}")
        return self.missions_dir / mid

    def _require_writable(self) -> None:
        if self.read_only:
            raise ValueError(f"workspace {self.proj!r} is read-only")

    def _load_slices(self, mission_id: str) -> list[dict]:
        slices_path = self._mission_dir(mission_id) / "slices.json"
        if not slices_path.is_file():
            raise FileNotFoundError(f"mission not found: {mission_id}")
        data = _read_json(slices_path)
        if not isinstance(data, list):
            raise ValueError(f"malformed slices.json for mission {mission_id}")
        return data

    @staticmethod
    def _find_slice(slices: list[dict], slice_id: str) -> dict:
        for entry in slices:
            if entry.get("id") == slice_id:
                return entry
        raise FileNotFoundError(f"slice not found: {slice_id}")

    def _save_slices(self, mission_id: str, slices: list[dict]) -> None:
        _write_json(self._mission_dir(mission_id) / "slices.json", slices)

    def _mint_id(self) -> str:
        stamp = datetime.now(UTC).strftime("%Y%m%d")
        for _ in range(5):
            candidate = f"rig-{stamp}-{secrets.token_hex(3)}"
            if not (self.missions_dir / candidate).exists():
                return candidate
        raise ValueError("could not mint a unique mission id")

    # ── missions ──────────────────────────────────────────────────────────────

    def create_mission(self, goal: str, slices: list[dict] | None = None) -> str:
        """Mint a mission id and lay down SPEC.md, state.json, slices.json, log."""
        self._require_writable()
        mission_id = self._mint_id()
        mdir = self.missions_dir / mission_id
        mdir.mkdir(parents=True, exist_ok=True)
        created_at = _now_iso()
        goal_text = str(goal or "")
        normalized = _normalize_slices(slices, created_at)
        (mdir / "SPEC.md").write_text(
            f"# Mission {mission_id}\n\n## Goal\n\n{goal_text}\n", encoding="utf-8"
        )
        _write_json(
            mdir / "state.json",
            {
                "id": mission_id,
                "status": "in_progress",
                "progress": f"0/{len(normalized)}",
                "goal": goal_text,
                "created_at": created_at,
            },
        )
        _write_json(mdir / "slices.json", normalized)
        self.append_log(mission_id, f"CREATED goal: {goal_text}")
        return mission_id

    def get_mission(self, mission_id: str) -> dict:
        state_path = self._mission_dir(mission_id) / "state.json"
        if not state_path.is_file():
            raise FileNotFoundError(f"mission not found: {mission_id}")
        state = _read_json(state_path)
        if not isinstance(state, dict):
            raise ValueError(f"malformed state.json for mission {mission_id}")
        return state

    def get_all_missions(self) -> list[dict]:
        """Every readable mission as ``{id, status, progress, goal}``, newest id last.

        A malformed or half-written mission on disk is skipped, never raised:
        the status routes iterate this and must not 500 on one bad directory.
        """
        if not self.missions_dir.is_dir():
            return []
        missions = []
        for entry in sorted(self.missions_dir.iterdir()):
            state_path = entry / "state.json"
            if not entry.is_dir() or not state_path.is_file():
                continue
            try:
                state = _read_json(state_path)
            except (OSError, ValueError):
                continue
            if not isinstance(state, dict) or "id" not in state:
                continue
            missions.append(
                {
                    "id": state["id"],
                    "status": state.get("status", "in_progress"),
                    "progress": state.get("progress", "0/0"),
                    "goal": state.get("goal", ""),
                }
            )
        return missions

    def update_mission_state(
        self, mission_id: str, *, status: str | None = None, progress: str | None = None
    ) -> None:
        self._require_writable()
        state = self.get_mission(mission_id)
        if status is not None:
            state["status"] = status
        if progress is not None:
            state["progress"] = progress
        _write_json(self._mission_dir(mission_id) / "state.json", state)

    # ── slices ────────────────────────────────────────────────────────────────

    def set_approved(self, mission_id: str, slice_id: str, approved: bool) -> None:
        """Record the human's approve/reject verdict on one slice."""
        self._require_writable()
        slices = self._load_slices(mission_id)
        self._find_slice(slices, slice_id)["approved"] = bool(approved)
        self._save_slices(mission_id, slices)

    def update_slice_state(self, mission_id: str, slice_id: str, state: str) -> None:
        if state not in SLICE_STATES:
            raise ValueError(f"invalid slice state: {state!r}")
        self._require_writable()
        slices = self._load_slices(mission_id)
        self._find_slice(slices, slice_id)["status"] = state
        self._save_slices(mission_id, slices)

    def get_paused_slices(self, mission_id: str) -> list[dict]:
        """Slices a run paused behind the risk gate (each carries ``id``)."""
        return [
            entry for entry in self._load_slices(mission_id)
            if entry.get("status") == "paused"
        ]

    def get_slice_report(self, mission_id: str) -> list[dict]:
        return [
            {
                "id": entry.get("id"),
                "status": entry.get("status"),
                "owner": entry.get("owner"),
                "is_risky": bool(entry.get("is_risky")),
                "approved": bool(entry.get("approved")),
                "title": entry.get("title"),
            }
            for entry in self._load_slices(mission_id)
        ]

    def get_active_slices(self, mission_id: str) -> list[dict]:
        """Slices whose status is not ``completed``/``failed`` — what is in flight."""
        return [
            entry for entry in self._load_slices(mission_id)
            if entry.get("status") not in FINAL_SLICE_STATES
        ]

    # ── log ───────────────────────────────────────────────────────────────────

    def read_log(self, mission_id: str) -> list[dict]:
        log_path = self._mission_dir(mission_id) / "log.jsonl"
        if not log_path.is_file():
            if not log_path.parent.is_dir():
                raise FileNotFoundError(f"mission not found: {mission_id}")
            return []
        records = []
        for line in log_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except ValueError:
                continue
            if isinstance(record, dict) and "event" in record:
                records.append({"ts": record.get("ts", ""), "event": record["event"]})
        return records

    def append_log(self, mission_id: str, event: str) -> None:
        self._require_writable()
        mdir = self._mission_dir(mission_id)
        if not mdir.is_dir():
            raise FileNotFoundError(f"mission not found: {mission_id}")
        record = {"ts": _now_iso(), "event": str(event)}
        with (mdir / "log.jsonl").open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
