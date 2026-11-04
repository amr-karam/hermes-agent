"""Goal -> slice planning for the Rig.

Deterministic by default: the goal text is split into sentences/lines and each
segment becomes one slice, owned by a seat in round-robin order. When an
``LLMClient`` is injected the model proposes the plan instead and its JSON is
validated here — an empty or unparseable plan raises ``LLMOutputError``.
Approval is never taken from model output: ``approved`` stays ``False``.
"""

from __future__ import annotations

import json
import re

from orchestration.llm_client import LLMClient, LLMOutputError

#: The five Rig seats; also the owner round-robin for planned slices.
SEATS: tuple[str, ...] = ("nexus", "librarian", "builder", "critic", "operator")

_RISK_WORDS = (
    "deploy", "deployment", "production", "prod", "rollback", "migrate",
    "migration", "schema", "delete", "drop", "destroy", "purge", "security",
    "credential", "secret", "payment", "billing", "publish", "release", "force",
)
_RISK_RE = re.compile(r"\b(?:" + "|".join(_RISK_WORDS) + r")\b", re.IGNORECASE)
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?;])\s+")
_TITLE_LIMIT = 72


class SlicingAgent:
    """Plan a goal into slices, deterministically or via an injected client."""

    def __init__(self, client: LLMClient | None = None) -> None:
        self.client = client

    def slice(self, goal: str) -> list[dict]:
        if self.client is None:
            return _deterministic_plan(goal)
        return _model_plan(goal, self.client)


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


def _title(segment: str) -> str:
    if len(segment) <= _TITLE_LIMIT:
        return segment
    return segment[: _TITLE_LIMIT - 3] + "..."


def _deterministic_plan(goal: str) -> list[dict]:
    return [
        {
            "id": f"s-{index + 1:02d}",
            "title": _title(segment),
            "owner": SEATS[index % len(SEATS)],
            "status": "pending",
            "is_risky": bool(_RISK_RE.search(segment)),
            "approved": False,
        }
        for index, segment in enumerate(_split_goal(goal))
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


def _model_slice(entry: dict, index: int) -> dict:
    owner = entry.get("owner")
    return {
        "id": f"s-{index + 1:02d}",
        "title": str(entry["title"]).strip(),
        "owner": owner if owner in SEATS else SEATS[index % len(SEATS)],
        "status": "pending",
        "is_risky": _as_bool(entry.get("is_risky")),
        # Approval is a human verdict; model output can never grant it.
        "approved": False,
    }


def _model_plan(goal: str, client: LLMClient) -> list[dict]:
    prompt = (
        "Split the goal below into concrete slices for a five-seat agent rig "
        f"(seats: {', '.join(SEATS)}).\n"
        'Return ONLY a JSON array; each entry: {"title": str, '
        '"owner": <seat>, "is_risky": bool}.\n'
        f"Goal:\n{goal}"
    )
    entries = _parse_plan(client.complete(prompt))
    return [_model_slice(entry, index) for index, entry in enumerate(entries)]
