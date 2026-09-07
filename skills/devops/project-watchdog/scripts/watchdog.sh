#!/usr/bin/env bash
# scripts/watchdog.sh - Run project QA gates on a timer, auto-fix via agent-self-reflection.
#
# Usage:  watchdog.sh [--once] [--interval SECONDS] [--scripts lint,typecheck,test]
set -euo pipefail

ONCE=0
INTERVAL="${HERMES_WATCHDOG_INTERVAL:-600}"
SCRIPTS_CSV="${HERMES_WATCHDOG_SCRIPTS:-lint,typecheck,test}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --once)     ONCE=1; shift;;
    --interval) INTERVAL="$2"; shift 2;;
    --scripts)  SCRIPTS_CSV="$2"; shift 2;;
    -h|--help)  sed -n '2,7p' "$0"; exit 0;;
    *) echo "watchdog: unknown arg: $1" >&2; exit 1;;
  esac
done

IFS=',' read -ra SCRIPTS <<< "$SCRIPTS_CSV"

run_npm() {
  local script="$1"
  timeout 180 npm run "$script" --silent 2>&1 || return $?
}

notify() {
  local msg="$1"
  echo "[WATCHDOG] $msg"
  if command -v hermes >/dev/null 2>&1; then
    hermes honcho conclude "[WATCHDOG] $msg" >/dev/null 2>&1 || true
  fi
}

invoke_reflection() {
  local ctx="$1"
  if command -v hermes >/dev/null 2>&1; then
    hermes honcho conclude "WATCHDOG CONTEXT: $ctx" >/dev/null 2>&1 || true
    hermes skill invoke agent-self-reflection >/dev/null 2>&1 || true
  fi
}

cycle() {
  if [[ ! -f package.json ]]; then
    echo "[watchdog] no package.json here -- skipping"
    return 0
  fi
  for s in "${SCRIPTS[@]}"; do
    if ! grep -q ""$s"" package.json; then
      continue  # script not defined -> skip silently
    fi
    if out="$(run_npm "$s")"; then
      notify "$s passed"
    else
      invoke_reflection "$out"
      if out2="$(run_npm "$s")"; then
        notify "$s PASSED after auto-fix"
      else
        notify "$s STILL FAILING after auto-fix"
      fi
    fi
  done
}

while :; do
  cycle
  [[ "$ONCE" -eq 1 ]] && break
  sleep "$INTERVAL"
done
