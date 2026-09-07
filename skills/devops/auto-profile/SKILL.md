---
name: auto-profile
description: "Switch Hermes profile based on the current working directory."
version: 1.0.0
author: amr-karam (https://github.com/amr-karam) - Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [profile, persona, routing, cwd, automation, devops]
    related_skills: [using-agent-skills, hermes-strategist, project-watchdog]
    config:
      honcho_fact_prefix: "profile_for:"
      fallback_profile: "default"
prerequisites:
  tools: [terminal]
  optional_commands: [hermes]
---

# Auto-Profile Skill

Switches the active Hermes profile to match the current working directory (cwd) by
looking up a Honcho fact of the form `profile_for:<absolute-path> = <profile>`. When
no mapping exists, the configured fallback profile (`default`) is kept.

## When to Use

- You want Hermes to adopt the right expert persona as soon as you `cd` into a project
  folder, without running `hermes profile switch` manually.
- A teammate shares a Honcho‑based profile mapping and you want it applied locally.
- You maintain multiple repositories (frontend, backend, devops) and want Hermes to
  pick the matching skill set automatically.

## When NOT to Use

- You are already happy with the current profile and don't want it changed.
- Honcho is not configured (`honcho.endpoint` missing) — the skill logs a warning
  and keeps the current profile.

## Prerequisites

- Hermes CLI on `PATH` (the script shells out to `hermes profile current` and
  `hermes profile switch`).
- A reachable Honcho instance with at least one `profile_for:*` fact. See the
  `honcho-conclude` skill or run:
  ```bash
  hermes honcho conclude "profile_for:$(pwd -W) = backend-engineer"
  ```
- The fallback profile (`default` by default) must exist:
  `hermes profile list` should show it.

## How to Run

The skill ships a portable bash helper. Run it directly, or call it from a hook:

```bash
bash skills/devops/auto-profile/scripts/auto_profile.sh
```

It exits `0` if a switch happened (or no switch was needed), `1` on error.

## Quick Reference

| Task | Command |
|------|---------|
| Manual switch for current directory | `hermes skill invoke auto-profile` |
| List profiles | `hermes profile list` |
| See active profile | `hermes profile current` |
| Add a mapping for `$(pwd)` | `hermes honcho conclude "profile_for:$(pwd -W) = <profile>"` |

## Procedure

1. **Resolve cwd.** `pwd -W` on Windows (msys) gives the native Windows path; on
   POSIX systems `pwd` is already absolute.
2. **Search Honcho.** Use the configured prefix (`profile_for:`) plus the resolved
   path. The script accepts an optional `--prefix` flag for custom namespaces.
3. **Compare to current profile.** If they differ, invoke
   `hermes profile switch <profile>` and log `[PROFILE] Switched to <profile> (matched <cwd>)`.
4. **Log a no‑op** (`[PROFILE] No mapping for <cwd>`) when nothing matches.
5. **Warn** (do not fail) if the Honcho endpoint is unreachable so the user can fix
   it without breaking the session.

## Pitfalls

- **MSYS path translation** — `$(pwd)` returns `/c/Users/...`; the script
  explicitly uses `pwd -W` so Honcho stores Windows‑style paths that match
  `hermes honcho` lookups on the same machine.
- **Profile not in list** — the switch will fail loudly; run `hermes profile list`
  first to see available options.
- **Honcho CLI surface drift** — older versions used `hermes honcho conclude`;
  newer builds use `hermes honcho map` or the `honcho_conclude` tool. The script
  documents both.

## Verification

After the script runs you should see a single line in the Hermes debug pane:

```
[PROFILE] Switched to backend-engineer (matched C:/.../apps/backend)
```

and `hermes profile current` should return the expected name.
