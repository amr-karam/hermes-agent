"""Dashboard chat surface: slash-command discovery for the embedded TUI.

The dashboard embeds the real ``hermes --tui`` over a PTY WebSocket, so slash
behaviour (including completion) lives in Ink and must not be rebuilt here.
This router is discovery-only: it lists the slash commands a user can type
into the terminal, with descriptions, so the sidebar can offer a searchable
palette that writes the selected command back into the PTY via the existing
stdin path (``ws.send(bytes)`` in ``ChatPage.tsx``).

Sources mirror the CLI's own view:
  * ``hermes_cli.commands.COMMAND_REGISTRY`` — the single source for built-ins.
  * ``agent.skill_commands.get_skill_commands()`` — profile-scoped skill
    commands, same table ``commands.catalog`` / ``complete.slash`` serve.
"""

from __future__ import annotations

import importlib
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from hermes_cli.web_routers._common import scoped_to_thread

_log = logging.getLogger("hermes_cli.web_server")

router = APIRouter(prefix="/api", tags=["chat"])


def _module(name: str) -> Any:
    """Import ``name`` on demand (keeps this router import-light)."""
    return importlib.import_module(name)


def _command_row(cmd: Any, *, source: str = "builtin", profile_scoped: bool = False) -> Dict[str, Any]:
    """Project a ``CommandDef`` into the wire shape the dashboard consumes."""
    return {
        "name": f"/{cmd.name}",
        "description": (cmd.description or "").strip(),
        "category": cmd.category,
        "aliases": [f"/{a}" for a in (getattr(cmd, "aliases", ()) or ())],
        "args_hint": cmd.args_hint or "",
        "subcommands": list(getattr(cmd, "subcommands", ()) or ()),
        "source": source,
        "profile_scoped": profile_scoped,
        "cli_only": bool(getattr(cmd, "cli_only", False)),
        "gateway_only": bool(getattr(cmd, "gateway_only", False)),
    }


def _list_commands(profile: Optional[str]) -> List[Dict[str, Any]]:
    """Built-in + skill slash commands, de-duplicated by canonical name."""
    rows: Dict[str, Dict[str, Any]] = {}

    def add(row: Dict[str, Any]) -> None:
        name = row["name"]
        existing = rows.get(name)
        if existing is None:
            rows[name] = row
            return
        # Built-ins win over skills of the same name; keep the richer row.
        if existing["source"] == "builtin" and row["source"] != "builtin":
            return
        if row["description"] and not existing["description"]:
            rows[name] = {**existing, "description": row["description"]}

    registry = getattr(_module("hermes_cli.commands"), "COMMAND_REGISTRY", []) or []
    for cmd in registry:
        add(_command_row(cmd, source="builtin", profile_scoped=False))

    try:
        skills = getattr(_module("agent.skill_commands"), "get_skill_commands", lambda: {})() or {}
    except Exception:
        _log.debug("skill command scan failed for /api/commands", exc_info=True)
        skills = {}
    for slug, entry in skills.items():
        if not isinstance(entry, dict):
            continue
        name = str(entry.get("name") or slug).strip()
        if not name:
            continue
        if not name.startswith("/"):
            name = f"/{name}"
        add({
            "name": name,
            "description": str(entry.get("description") or "").strip(),
            "category": "Skills",
            "aliases": [],
            "args_hint": "",
            "subcommands": [],
            "source": f"skill:{slug.lstrip('/')}",
            "profile_scoped": True,
            "cli_only": False,
            "gateway_only": False,
        })

    return list(rows.values())


@router.get("/commands")
async def list_commands(profile: Optional[str] = Query(None)):
    """List every slash command the embedded TUI accepts, with descriptions.

    Used by the dashboard's command palette so users can discover commands
    without memorizing them or leaving the chat tab. Profile-scoped skill
    commands are included; ``profile`` is advisory here (the PTY itself is
    the authority on what a given session may run).
    """
    commands = await scoped_to_thread(profile, lambda: _list_commands(profile))
    return {"commands": commands, "count": len(commands)}