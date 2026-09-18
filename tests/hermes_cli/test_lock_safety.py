"""Guard test: ``msvcrt.LK_LOCK`` must never be used in production code.

``LK_LOCK`` is a blocking lock that raises ``OSError(Errno 36, EDEADLK)`` when the
*same process* already holds the file region — a deadlock that crashes sessions.
The correct pattern is ``LK_NBLCK`` + a bounded retry loop (see ``_flock`` and
``hermes_state_common._acquire_msvcrt_lock``).

This test catches regressions by scanning all production .py modules in a single
pass for bare ``msvcrt.LK_LOCK`` usage outside comments.
"""

import re
from pathlib import Path

import pytest

# ``msvcrt.LK_LOCK`` must not appear in production source (only ``LK_NBLCK`` or
# ``LK_UNLCK``).
_BARE_LK_LOCK = re.compile(r"msvcrt\.LK_LOCK\b")

# Directories that contain production code.
_PRODUCTION_DIRS = [
    "hermes_cli",
    "cron",
    "tools",
    "gateway",
    "plugins",
    "tui_gateway",
    "agent",
]


def _check_file(path: Path) -> list[str]:
    """Return list of ``file:line: line`` strings for any bare LK_LOCK usage."""
    offenders: list[str] = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        stripped = line.lstrip()
        if stripped.startswith("#"):
            continue
        if _BARE_LK_LOCK.search(line):
            offenders.append(f"{path}:{lineno}: {line.strip()}")
    return offenders


def test_no_bare_msvcrt_LK_LOCK_in_production() -> None:
    """``msvcrt.locking`` must use ``LK_NBLCK`` (non-blocking) + retry, never ``LK_LOCK``."""
    root = Path(__file__).resolve().parents[2]
    all_offenders: list[str] = []
    for pkg in _PRODUCTION_DIRS:
        pkg_root = root / pkg
        if not pkg_root.is_dir():
            continue
        for f in pkg_root.rglob("*.py"):
            name = f.name
            if name.startswith("test_") or name == "conftest.py":
                continue
            if "tests" in f.parts:
                continue
            all_offenders.extend(_check_file(f))

    if all_offenders:
        pytest.fail(
            "msvcrt.LK_LOCK found in production code — use LK_NBLCK with a "
            "bounded retry loop instead.\n"
            + "\n".join(f"  → {o}" for o in all_offenders),
            pytrace=False,
        )
