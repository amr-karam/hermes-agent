#!/usr/bin/env bash
# scripts/auto_profile.sh - Switch Hermes profile based on cwd + Honcho fact.
#
# Usage:   auto_profile.sh [--prefix PREFIX] [--fallback PROFILE] [--dry-run]
#
# Exit:    0 = switched or no-op; 1 = hard error (e.g. Hermes CLI missing).
set -euo pipefail

PREFIX="${HERMES_AUTO_PROFILE_PREFIX:-profile_for:}"
FALLBACK="${HERMES_AUTO_PROFILE_FALLBACK:-default}"
DRY_RUN=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prefix)   PREFIX="$2"; shift 2;;
    --fallback) FALLBACK="$2"; shift 2;;
    --dry-run)  DRY_RUN=1; shift;;
    -h|--help)  sed -n '2,8p' "$0"; exit 0;;
    *) echo "auto_profile: unknown arg: $1" >&2; exit 1;;
  esac
done

command -v hermes >/dev/null 2>&1 || { echo "auto_profile: hermes CLI not on PATH" >&2; exit 1; }

# 1️⃣ Resolve absolute path (Windows-native on MSYS).
if command -v pwd >/dev/null 2>&1; then
  if pwd -W >/dev/null 2>&1; then
    CWD="$(pwd -W)"
  else
    CWD="$(pwd)"
  fi
else
  CWD="$(cd . && pwd)"
fi

CURRENT="$(hermes profile current 2>/dev/null || echo "$FALLBACK")"
TARGET="$CURRENT"

# 2️⃣ Look up a Honcho fact matching the prefix + path.
#    The exact command differs across Hermes versions; we try the modern tool
#    first, then fall back to the legacy CLI.
FACT=""
if command -v honcho_search >/dev/null 2>&1; then
  FACT="$(honcho_search --peer user --query "${PREFIX}${CWD}" --max_tokens 200 2>/dev/null     | grep -F "${PREFIX}${CWD} =" | head -n1 || true)"
fi
if [[ -z "$FACT" ]] && hermes honcho search "${PREFIX}${CWD}" >/dev/null 2>&1; then
  FACT="$(hermes honcho search "${PREFIX}${CWD}" 2>/dev/null | grep -F "${PREFIX}${CWD} =" | head -n1 || true)"
fi
if [[ -z "$FACT" ]] && hermes honcho conclude --help >/dev/null 2>&1; then
  # Legacy `hermes honcho conclude <text>` syntax is a no-op here, but the help
  # call ensures the command is at least recognised.
  :
fi

if [[ -n "$FACT" ]]; then
  TARGET="${FACT##*= }"   # everything after the last "= "
  TARGET="${TARGET%%$'
'*}"  # strip trailing newline if any
fi

# 3️⃣ Act on the resolved target.
if [[ "$TARGET" != "$CURRENT" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[PROFILE] would switch: $CURRENT -> $TARGET (matched $CWD)"
  else
    if hermes profile switch "$TARGET" >/dev/null 2>&1; then
      echo "[PROFILE] Switched to $TARGET (matched $CWD)"
    else
      echo "[PROFILE] WARN: 'hermes profile switch $TARGET' failed; keeping $CURRENT" >&2
      exit 1
    fi
  fi
else
  echo "[PROFILE] No mapping for $CWD (keeping $CURRENT)"
fi
