#!/usr/bin/env python3
"""Drift guard: the transparent-window kinds in the renderer shell and in
src/main.tsx must stay in step.

apps/desktop/index.html pre-paints the themed background for opaque windows
only; src/main.tsx defines TRANSPARENT_WINDOWS for the renderer side of the
same decision. When a window kind is added to one and not the other, either a
transparent window pre-paints an opaque rectangle (the exact "flash" the
pre-paint exists to prevent on the intro cinematic) or an opaque window stops
painting its background and shows UA white. Both files say "keep the two in
step" in comments; this makes drift fail loudly instead.

Advisory in the same class as check_profile_scope_patterns.py: it greps two
declared lists, it does not test behaviour.
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
HTML = REPO_ROOT / "apps/desktop/index.html"
MAIN_TSX = REPO_ROOT / "apps/desktop/src/main.tsx"

# The renderer shell's gate: ['hud', 'overlay', ...].includes(win) — the
# transparent kinds are the complement the pre-paint skips.
HTML_PATTERN = re.compile(r"\[([^\]]*)\]\.includes\(win\)")
# The renderer's own copy: new Set(['hud', 'overlay', ...]).
MAIN_PATTERN = re.compile(r"TRANSPARENT_WINDOWS\s*=\s*new Set\(\[([^\]]*)\]\)")
KIND = re.compile(r"'([^']+)'")


def kinds(source: str, label: str) -> set[str]:
    match = HTML_PATTERN.search(source) if label == "index.html" else MAIN_PATTERN.search(source)
    if not match:
        print(f"error: could not find the window-kind list in {label}", file=sys.stderr)
        sys.exit(2)
    return set(KIND.findall(match.group(1)))


def main() -> int:
    html_kinds = kinds(HTML.read_text(encoding="utf-8"), "index.html")
    main_kinds = kinds(MAIN_TSX.read_text(encoding="utf-8"), "main.tsx")

    if html_kinds != main_kinds:
        print(
            "transparent-window drift:\n"
            f"  index.html : {sorted(html_kinds)}\n"
            f"  main.tsx   : {sorted(main_kinds)}\n"
            "Add the new kind to BOTH lists (or remove it from both).",
            file=sys.stderr,
        )
        return 1

    print(f"ok: transparent window kinds in step ({len(main_kinds)}): {', '.join(sorted(main_kinds))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
