"""Goal -> slice planning for the Rig.

Merged interface:

* Keeps local's deterministic planner as the default path (no model, no network,
  graceful degradation): split the goal into sentences/lines, each becomes one
  slice owned by a seat in round-robin order, keyword-scan marks risky slices,
  and ``approved`` stays ``False`` (approval is a human verdict, never granted
  by model output).
* Adds server's OpenRig enhancements as optional layers:
  :class:`Slice` dataclass carrying ``dependencies``, ``priority``,
  ``assigned_agent``, ``risk_reason``; a model-based ``decompose`` path through
  an injected :class:`~orchestration.llm_client.LLMClient` transport; and rich
  per-slice metadata persisted by :meth:`WorkspaceManager.add_slice`.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

from orchestration.llm_client import LLMClient, LLMOutputError

#: The five Rig seats; also the owner round-robin for planned slices.
SEATS: tuple[str, ...] = ("nexus", "librarian", "builder", "critic", "operator")

#: Keywords that mark a slice as risky (needs human approval before execution).
_RISK_WORDS = (
    "deploy", "deployment", "production", "prod", "rollback", "migrate",
    "migration", "schema", "delete", "drop", "destroy", "purge", "security",
    "credential", "secret", "payment", "billing", "publish", "release", "force",
)
_RISK_RE = re.compile(r"\b(?:" + "|".join(_RISK_WORDS) + r")\b", re.IGNORECASE)
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?;])\s+")
_TITLE_LIMIT = 72


@dataclass
class Slice:
    """One verifiable unit of work in a mission plan.

    ``assigned_agent`` must be one of the Rig seats. ``is_risky`` gates
    execution behind human approval; ``risk_reason`` documents why.
    """

    id: str
    title: str
    spec: str
    dependencies: list[str] = field(default_factory=list)
    priority: int = 1
    assigned_agent: str = "builder"
    is_risky: bool = False
    risk_reason: str = ""

    def to_plan_entry(self, index: int) -> dict:
        """Render as a ``slices.json`` entry (the contract the workspace stores)."""
        return {
            "id": f"s-{index + 1:02d}",
            "title": self.title[: _TITLE_LIMIT - 3] + "..." if len(self.title) > _TITLE_LIMIT else self.title,
            "owner": self.assigned_agent if self.assigned_agent in SEATS else SEATS[index % len(SEATS)],
            "status": "pending",
            "is_risky": self.is_risky,
            "approved": False,  # human verdict only; model output never grants it
            "dependencies": list(self.dependencies),
            "priority": self.priority,
            "assigned_agent": self.assigned_agent,
            "risk_reason": self.risk_reason,
        }


class SlicingAgent:
    """Plan a goal into slices, deterministically or via an injected client."""

    def __init__(self, client: LLMClient | None = None) -> None:
        self.client = client

    # ── public API ────────────────────────────────────────────────────────────

    def slice(self, goal: str) -> list[dict]:
        """Return ``slices.json`` entries for ``goal``.

        Uses the injected client when one is configured; otherwise falls back
        to deterministic sentence splitting so a model outage never blocks the
        default path.
        """
        if self.client is None:
            return _deterministic_plan(goal)
        return [_to_entry(s, i) for i, s in enumerate(_model_plan(goal, self.client))]

    def decompose(self, goal: str, context: str) -> list[Slice]:
        """Model-backed decomposition into rich :class:`Slice` objects.

        Requires an injected client; raises :class:`LLMOutputError` if the
        model is unreachable or returns unparseable JSON — a fabricated plan is
        never substituted, because the Rig would execute it for real.
        """
        if self.client is None:
            raise LLMOutputError("no LLM client configured for model-backed decomposition")
        return self._model_plan(goal, context)

    # ── deterministic planner (default, model-free) ──────────────────────────

    @staticmethod
    def _split_goal(goal: str) -> list[str]:
        text = (goal or "").strip()
        if not text:
            return []
        raw = [
            part
            for line in text.splitlines()
            for part in _SENTENCE_SPLIT.split(line)
        ]
        stripped = [part.strip() for part in raw]
        return [part for part in stripped if part] or [text]


def _to_entry(slice_obj: Slice, index: int) -> dict:
    entry = slice_obj.to_plan_entry(index)
    # Override owner with round-robin if the slice assigned an unknown seat.
    if entry["owner"] not in SEATS:
        entry["owner"] = SEATS[index % len(SEATS)]
    return entry


def _deterministic_plan(goal: str) -> list[dict]:
    return [
        {
            "id": f"s-{index + 1:02d}",
            "title": segment[: _TITLE_LIMIT - 3] + "..." if len(segment) > _TITLE_LIMIT else segment,
            "owner": SEATS[index % len(SEATS)],
            "status": "pending",
            "is_risky": bool(_RISK_RE.search(segment)),
            "approved": False,
            "dependencies": [],
            "priority": 1,
            "assigned_agent": SEATS[index % len(SEATS)],
            "risk_reason": "",
        }
        for index, segment in enumerate(SlicingAgent._split_goal(goal))
    ]


def _as_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "yes", "on")
    return bool(value)


def _parse_plan(raw: str) -> list[dict]:
    """Pull the JSON array out of the model's answer; anything else is an error."""
    text = raw.strip()
    start, end = text.find("["), text.rfind("]")
    if start == -1 or end <= start:
        raise LLMOutputError("model plan is not a JSON array")
    try:
        entries = json.loads(text[start : end + 1])
    except ValueError as exc:
        raise LLMOutputError(f"model plan is not valid JSON: {exc}") from exc
    if not isinstance(entries, list):
        raise LLMOutputError("model plan is not a JSON array")
    for entry in entries:
        if not isinstance(entry, dict) or not str(entry.get("title", "")).strip():
            raise LLMOutputError(f"model plan entry lacks a title: {entry!r}")
    return entries


def _model_slice(entry: dict, index: int) -> Slice:
    owner = entry.get("owner")
    return Slice(
        id=f"slice-{index + 1}",
        title=str(entry["title"]).strip(),
        spec=str(entry.get("spec", entry["title"])).strip(),
        dependencies=list(entry.get("dependencies", [])),
        priority=int(entry.get("priority", 1)),
        assigned_agent=owner if owner in SEATS else SEATS[index % len(SEATS)],
        is_risky=_as_bool(entry.get("is_risky", False)),
        risk_reason=str(entry.get("risk_reason", "")),
    )


def _model_plan(goal: str, client: LLMClient, context: str = "") -> list[Slice]:
    prompt = (
        "Split the goal below into concrete slices for a five-seat agent rig "
        f"(seats: {', '.join(SEATS)}).\n"
        'Return ONLY a JSON array; each entry: {"title": str, '
        '"spec": str, "owner": <seat>, "dependencies": [str], '
        '"priority": int, "assigned_agent": <seat>, "is_risky": bool, '
        '"risk_reason": str}.\n'
        f"Goal:\n{goal}\nContext:\n{context}"
    )
    entries = _parse_plan(client.complete(prompt))
    return [_model_slice(entry, index) for index, entry in enumerate(entries)]
