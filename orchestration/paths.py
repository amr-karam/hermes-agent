"""Project root and workspace project-name resolution for the Rig.

Resolution order: explicit argument -> environment variable -> cwd.
Returns a :class:`~pathlib.Path` by default; :func:`resolve_root_str` is
provided for OpenRig tooling that wants a string.
"""

from __future__ import annotations

import os
from pathlib import Path

#: Default workspace project name when neither an argument nor the env says otherwise.
DEFAULT_PROJECT = "hermes-core"

ROOT_ENV = "HERMES_RIG_ROOT"
PROJECT_ENV = "HERMES_RIG_PROJECT"


def resolve_root(project_root: str | Path | None = None) -> Path:
    """Resolve the project root: explicit argument, then ``$HERMES_RIG_ROOT``, then cwd.

    The dashboard routes call this with no arguments, so the env/cwd fallbacks
    are the live path there; the CLI forwards ``--project-root`` when given.
    """
    if project_root:
        return Path(project_root).expanduser().resolve()
    env_root = os.environ.get(ROOT_ENV, "").strip()
    if env_root:
        return Path(env_root).expanduser().resolve()
    return Path.cwd().resolve()


def resolve_root_str(project_root: str | Path | None = None) -> str:
    """Same as :func:`resolve_root` but returning a string (OpenRig tooling)."""
    return str(resolve_root(project_root))


def resolve_project_name(project_name: str | None = None) -> str:
    """Resolve the project name: argument, then ``$HERMES_RIG_PROJECT``, or default."""
    if project_name:
        return project_name
    env_name = os.environ.get(PROJECT_ENV, "").strip()
    return env_name or DEFAULT_PROJECT
