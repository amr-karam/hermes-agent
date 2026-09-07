---
name: project-watchdog
description: "Run lint/typecheck/test on a timer, auto-fix failures."
version: 1.0.0
author: amr-karam (https://github.com/amr-karam) - Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [ci, qa, lint, typecheck, test, self-heal, watchdog, devops]
    related_skills: [auto-profile, project-watchdog, hermes-strategist]
    config:
      interval_seconds: 600
      npm_scripts: [lint, typecheck, test]
prerequisites:
  tools: [terminal]
  optional_commands: [npm, agent-self-reflection]
---

# Project Watchdog Skill

Runs the project’s quality gates (lint, typecheck, test) on a timer. On the first
failure, the captured output is handed to the `agent-self-reflection` skill which
analyses the root cause, proposes a patch, applies it, and re-runs the gate to
verify. A short notification is then posted via `hermes honcho conclude` so it
shows up in the Hermes debug pane.

## When to Use

- You want Hermes to keep your project green while you work on other things.
- You are tired of manually re‑running `npm run lint` after every edit.
- You want a self‑healing CI loop without setting up a real CI server.

## When NOT to Use

- The project has no `package.json` (the script will log a warning and skip the
  cycle — extend `scripts/watchdog.sh` to detect other manifests like
  `Cargo.toml`, `pyproject.toml`, `pom.xml`).
- The build is non‑deterministic or takes longer than the per‑script timeout
  (default 180 s; raise it in the script).

## Prerequisites

- Node.js + npm on `PATH` (only required when `package.json` is present).
- The `agent-self-reflection` skill installed (any version that exposes
  `hermes skill invoke agent-self-reflection`).
- A reachable Honcho instance so the watchdog can post notifications.

## How to Run

```bash
# Foreground (one cycle then exit)
bash skills/devops/project-watchdog/scripts/watchdog.sh --once

# Daemonised (default 600 s interval; override with --interval)
bash skills/devops/project-watchdog/scripts/watchdog.sh --interval 300
```

Add the daemon to your `~/.bashrc` or Hermes startup if you want it to run
permanently; the script is idempotent.

## Quick Reference

| Task | Command |
|------|---------|
| One‑off health check | `bash scripts/watchdog.sh --once` |
| Custom interval | `bash scripts/watchdog.sh --interval 900` |
| Disable a gate | Edit `npm_scripts` in the `metadata.hermes.config` block. |
| View last 20 watchdog notes | `hermes honcho search "[WATCHDOG]"` |

## Procedure

1. **Detect project type** by scanning for `package.json` (Node) — extend for
   other stacks as needed.
2. **Run each gate** in `lint`, `typecheck`, `test` order; stop on the first
   failure.
3. **Capture output** (stdout + stderr) and store it as a Honcho conclution
   prefixed with `WATCHDOG CONTEXT:`.
4. **Invoke** `hermes skill invoke agent-self-reflection` so the self‑heal
   loop kicks in.
5. **Re‑run** the same gate and post the result (`PASSED after auto‑fix` or
   `STILL FAILING`) as a `[WATCHDOG]` note in Honcho.
6. **Sleep** `interval_seconds` (default 600) and loop forever — or exit after
   one cycle when called with `--once`.

## Pitfalls

- **Long‑running builds** will hit the 180 s timeout. Raise the `timeout`
  constant in `watchdog.sh` for monorepos with slow CI.
- **Custom npm script names** (e.g. `test:unit`) must be added to
  `npm_scripts` in the skill config; the watchdog will skip missing scripts
  silently.
- **Honcho unreachable** — the script will still try to post but will not block
  the watchdog loop.

## Verification

Trigger a known lint error, wait one interval, and check:

```bash
hermes honcho search "[WATCHDOG]"
# expected: a line like "[WATCHDOG] lint PASSED after auto-fix"
```
