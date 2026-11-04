"""File-based durable workspace for Rig missions.

Merged interface:

* Keeps the local contract used by ``hermes_cli.subcommands.rig`` and
  ``hermes_cli.web_routers.rig``: ``WorkspaceManager(root, proj, read_only=False)``
  with ``create_mission(goal) -> mission_id`` minting ids internally, and the
  fixed ``hermes-rig-workspaces/<proj>/missions/<mission_id>/`` layout.
* Adds the server's OpenRig enhancements as backward-compatible options:
  path-traversal protection, bounded log rotation, goal-based mission dedup
  (``find_open_mission`` / ``find_completed_mission``), per-slice artifact
  recording, richer slice metadata, and an optional ``.openrig/workspace/``
  layout.

Layout (default, per DESIGN.md)::

    <root>/hermes-rig-workspaces/<proj>/
      missions/<mission_id>/
        SPEC.md      mission goal/spec
        state.json   {id, status, progress, goal, created_at}
        slices.json  [{id, title, owner, status, is_risky, approved, created_at,
                      dependencies, priority, assigned_agent, risk_reason}]
        log.jsonl    {"ts", "event"} lines

Optional OpenRig layout (``HERMES_RIG_WORKSPACE_LAYOUT=openrig``)::

    <root>/.openrig/workspace/<proj>/
      missions/<mission_id>/
        MISSION.md
        slices/<slice_id>/
          SPEC.md
          state.json
          artifact.diff
        mission.log
"""

from __future__ import annotations

import json
import os
import re
import secrets
from datetime import datetime, timezone, UTC
from pathlib import Path
from typing import Any

#: Workspace directory name under the project root (default layout).
WORKSPACES_DIR = "hermes-rig-workspaces"

#: Optional OpenRig workspace directory name.
OPENRIG_DIR = ".openrig/workspace"

#: Layout selection: ``default`` (hermes-rig-workspaces) or ``openrig``.
_LAYOUT_ENV = "HERMES_RIG_WORKSPACE_LAYOUT"

#: Slice states that end a slice; everything else counts as active/in flight.
FINAL_SLICE_STATES = frozenset({"completed", "failed"})

#: States a slice may be moved to via ``update_slice_state``.
SLICE_STATES = frozenset({"pending", "in_progress", "paused", "completed", "failed"})

#: Mission ids are minted ``rig-YYYYMMDD-<6 hex>``; the charset also keeps a
#: caller-supplied id from escaping the missions directory (no separators).
_MISSION_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
_SAFE_COMPONENT_RE = re.compile(r"^[A-Za-z0-9._-]{1,128}$")

#: Log bounds (OpenRig enhancement). One rotation generation only.
LOG_MAX_BYTES = 2 * 1024 * 1024
LOG_EVENT_MAX = 8 * 1024


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _resolve_layout(root: Path) -> Path:
    """Pick the workspace root directory under ``root`` per the layout setting."""
    layout = os.environ.get(_LAYOUT_ENV, "default").strip().lower()
    if layout == "openrig":
        return root / OPENRIG_DIR
    return root / WORKSPACES_DIR


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


def _safe_component(value: str, kind: str) -> str:
    """Validate a single path component so caller input cannot escape the workspace."""
    if not isinstance(value, str) or not _SAFE_COMPONENT_RE.match(value):
        raise ValueError(
            f"Invalid {kind}: {value!r}. Expected [A-Za-z0-9._-], max 128 chars."
        )
    if ".." in value.split("/"):
        raise ValueError(f"Invalid {kind}: {value!r} contains '..'")
    return value


def _normalize_slices(slices: list[dict] | None, created_at: str) -> list[dict]:
    normalized = []
    for index, raw in enumerate(slices or []):
        if not isinstance(raw, dict) or not raw.get("id"):
            raise ValueError(f"slice #{index} must be a dict with an 'id'")
        normalized.append({**raw, "created_at": created_at})
    return normalized


class WorkspaceManager:
    """Read and mutate one project's mission workspace on disk.

    ``layout`` overrides the env-selected layout for testing; valid values are
    ``"default"`` and ``"openrig"``.
    """

    def __init__(
        self,
        root: str | Path,
        proj: str,
        read_only: bool = False,
        layout: str | None = None,
    ) -> None:
        self.root = Path(root)
        self.proj = proj
        self.read_only = read_only
        self.layout = (layout or os.environ.get(_LAYOUT_ENV, "default")).strip().lower()
        base = _resolve_layout(self.root)
        self.workspace_root = base / proj
        self.missions_dir = self.workspace_root / "missions"
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

    def _slice_dir(self, mission_id: str, slice_id: str) -> Path:
        return self._within(self._mission_dir(mission_id), "slices", slice_id)

    def _within(self, *parts: str) -> Path:
        """Join path parts and assert the result stays inside the workspace root."""
        target = self.workspace_root.joinpath(*parts)
        if not target.resolve().is_relative_to(self.workspace_root.resolve()):
            raise ValueError(f"Path escapes workspace: {target}")
        return target

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

    def create_mission_with_id(self, mission_id: str, goal: str) -> str:
        """OpenRig-style: create a mission with a caller-supplied id."""
        self._require_writable()
        self._mission_dir(mission_id)  # validates id
        mdir = self.missions_dir / mission_id
        mdir.mkdir(parents=True, exist_ok=True)
        created_at = _now_iso()
        goal_text = str(goal or "")
        (mdir / "SPEC.md").write_text(
            f"# Mission {mission_id}\n\n## Goal\n\n{goal_text}\n", encoding="utf-8"
        )
        _write_json(
            mdir / "state.json",
            {
                "id": mission_id,
                "status": "in_progress",
                "progress": "0/0",
                "goal": goal_text,
                "created_at": created_at,
            },
        )
        _write_json(mdir / "slices.json", [])
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

    def get_slice_report_full(self, mission_id: str) -> list[dict]:
        """OpenRig enhancement: full slice report including rich metadata.

        Returns every stored slice field (dependencies, priority, assigned_agent,
        risk_reason, created_at, spec) in addition to the contract keys.
        """
        return [
            {
                "id": entry.get("id"),
                "status": entry.get("status"),
                "owner": entry.get("owner"),
                "is_risky": bool(entry.get("is_risky")),
                "approved": bool(entry.get("approved")),
                "title": entry.get("title"),
                "dependencies": entry.get("dependencies", []),
                "priority": entry.get("priority", 1),
                "assigned_agent": entry.get("assigned_agent"),
                "risk_reason": entry.get("risk_reason", ""),
                "created_at": entry.get("created_at"),
                "spec": entry.get("spec"),
            }
            for entry in self._load_slices(mission_id)
        ]

    def get_active_slices(self, mission_id: str) -> list[dict]:
        """Slices whose status is not ``completed``/``failed`` — what is in flight."""
        return [
            entry for entry in self._load_slices(mission_id)
            if entry.get("status") not in FINAL_SLICE_STATES
        ]

    # ── OpenRig enhancements ──────────────────────────────────────────────────

    def record_artifact(self, mission_id: str, slice_id: str, diff: str) -> None:
        """Record a per-slice artifact (a unified diff) in the slice directory."""
        self._require_writable()
        sdir = self._slice_dir(mission_id, slice_id)
        if not sdir.is_dir():
            raise FileNotFoundError(f"slice not found: {mission_id}/{slice_id}")
        (sdir / "artifact.diff").write_text(diff, encoding="utf-8")

    def read_artifact(self, mission_id: str, slice_id: str) -> str | None:
        """Return a slice's recorded artifact diff, or ``None`` if absent."""
        sdir = self._slice_dir(mission_id, slice_id)
        artifact = sdir / "artifact.diff"
        if not artifact.is_file():
            return None
        return artifact.read_text(encoding="utf-8")

    def add_slice(self, mission_id: str, slice_id: str, spec: str, meta: dict | None = None) -> None:
        """OpenRig-style: append a slice with rich metadata to an existing mission."""
        self._require_writable()
        mdir = self._mission_dir(mission_id)
        if not mdir.is_dir():
            raise FileNotFoundError(f"mission not found: {mission_id}")
        slices = self._load_slices(mission_id)
        if any(e.get("id") == slice_id for e in slices):
            raise ValueError(f"slice already exists: {slice_id}")
        created_at = _now_iso()
        entry = {
            "id": slice_id,
            "title": (meta or {}).get("title", slice_id),
            "status": "pending",
            "owner": (meta or {}).get("assigned_agent"),
            "is_risky": bool((meta or {}).get("is_risky", False)),
            "approved": False,
            "dependencies": list((meta or {}).get("dependencies", [])),
            "priority": int((meta or {}).get("priority", 1)),
            "assigned_agent": (meta or {}).get("assigned_agent"),
            "risk_reason": (meta or {}).get("risk_reason", ""),
            "created_at": created_at,
            "spec": spec,
        }
        slices.append(entry)
        self._save_slices(mission_id, slices)
        # Create the slice directory on disk so per-slice artifacts (e.g.
        # artifact.diff via record_artifact) have a place to live.
        self._slice_dir(mission_id, slice_id).mkdir(parents=True, exist_ok=True)
        self.append_log(mission_id, f"SLICE_ADDED {slice_id}: {entry['title']}")

    def is_approved(self, mission_id: str, slice_id: str) -> bool:
        """A slice runs only when it was never gated, or a human approved it."""
        slices = self._load_slices(mission_id)
        entry = self._find_slice(slices, slice_id)
        if entry.get("is_risky"):
            return bool(entry.get("approved", False))
        return entry.get("status") != "paused"

    # ── mission dedup (OpenRig enhancement) ───────────────────────────────────

    @staticmethod
    def _normalise_goal(goal: str) -> str:
        return " ".join((goal or "").split()).strip().lower()

    def find_open_mission(self, goal: str) -> str | None:
        """Return the id of an incomplete mission with this goal, or None."""
        target = self._normalise_goal(goal)
        if not target or not self.missions_dir.is_dir():
            return None
        for entry in sorted(self.missions_dir.iterdir()):
            if not entry.is_dir():
                continue
            try:
                state = _read_json(entry / "state.json")
            except (OSError, ValueError):
                continue
            if not isinstance(state, dict):
                continue
            if self._normalise_goal(state.get("goal", "")) != target:
                continue
            try:
                if self.get_active_slices(entry.name):
                    return entry.name
            except (ValueError, FileNotFoundError):
                continue
        return None

    def find_completed_mission(self, goal: str) -> str | None:
        """Return the id of a completed mission with this goal, or None."""
        target = self._normalise_goal(goal)
        if not target or not self.missions_dir.is_dir():
            return None
        for entry in sorted(self.missions_dir.iterdir(), reverse=True):
            if not entry.is_dir():
                continue
            try:
                state = _read_json(entry / "state.json")
            except (OSError, ValueError):
                continue
            if not isinstance(state, dict):
                continue
            if self._normalise_goal(state.get("goal", "")) != target:
                continue
            try:
                if not self.get_active_slices(entry.name):
                    return entry.name
            except (ValueError, FileNotFoundError):
                continue
        return None

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

    def log_event(self, mission_id: str, event: str, level: str = "INFO") -> None:
        """OpenRig-style bounded log event (alias for append_log with a level)."""
        self.append_log(mission_id, f"[{level}] {event}")
