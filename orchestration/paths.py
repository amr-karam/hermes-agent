"""Project root and workspace project-name resolution for the Rig."""

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
        return Path(project_root).expanduser()
    env_root = os.environ.get(ROOT_ENV, "").strip()
    if env_root:
        return Path(env_root).expanduser()
    return Path.cwd()


def resolve_project_name(project_name: str | None = None) -> str:
    """Resolve the project name: argument, then ``$HERMES_RIG_PROJECT``, or default."""
    if project_name:
        return project_name
    env_name = os.environ.get(PROJECT_ENV, "").strip()
    return env_name or DEFAULT_PROJECT
