#!/usr/bin/env bash
# scripts/strategist.sh - Read project context and emit three goal suggestions.
#
# Usage:  strategist.sh [--once] [--interval SECONDS]
set -euo pipefail

ONCE=0
INTERVAL="${HERMES_STRATEGIST_INTERVAL:-3600}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --once)     ONCE=1; shift;;
    --interval) INTERVAL="$2"; shift 2;;
    -h|--help)  sed -n '2,6p' "$0"; exit 0;;
    *) echo "strategist: unknown arg: $1" >&2; exit 1;;
  esac
done

notify() {
  local msg="$1"
  echo "[STRATEGIST] $msg"
  if command -v hermes >/dev/null 2>&1; then
    hermes honcho conclude "[STRATEGIST] $msg" >/dev/null 2>&1 || true
  fi
}

gather_context() {
  local ctx=""
  for f in PROJECT_STATUS.md ROADMAP.md TECH_DEBT.md; do
    if [[ -f "$f" ]]; then
      ctx+="
--- $f (head) ---
$(head -40 "$f")"
    fi
  done
  if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    ctx+="
--- git log (last 3) ---
$(git log -n 3 --oneline 2>/dev/null || true)"
  fi
  printf '%b' "$ctx"
}

# The heavy lifting (ranking, formatting) is delegated to the Hermes agent
# itself via `hermes skill invoke hermes-strategist`. This shell wrapper just
# manages the schedule and the gather step.
while :; do
  CONTEXT="$(gather_context)"
  if command -v hermes >/dev/null 2>&1; then
    hermes honcho conclude "STRATEGIST CONTEXT: ${CONTEXT:0:2000}" >/dev/null 2>&1 || true
    hermes skill invoke hermes-strategist >/dev/null 2>&1 || true
  else
    notify "hermes CLI not on PATH - skipping"
  fi
  [[ "$ONCE" -eq 1 ]] && break
  sleep "$INTERVAL"
done
