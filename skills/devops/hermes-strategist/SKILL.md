---
name: hermes-strategist
description: "Suggest the next three goals, hourly, with a skill."
version: 1.0.0
author: amr-karam (https://github.com/amr-karam) - Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [strategy, planning, goals, suggestions, autonomous, devops]
    related_skills: [auto-profile, project-watchdog, hermes-strategist]
    config:
      interval_seconds: 3600
      project_status_files: [PROJECT_STATUS.md, ROADMAP.md, TECH_DEBT.md]
prerequisites:
  tools: [terminal, read_file, search_files]
  optional_commands: [git, hermes]
---

# Hermes Strategist Skill

Reads your project’s high‑level planning docs (`PROJECT_STATUS.md`,
`ROADMAP.md`, `TECH_DEBT.md`), recent Honcho conclutions, and the last few git
commits. It then ranks what matters **right now** into three goal suggestions,
each tagged with a priority (`CRITICAL`, `STRATEGIC`, `MAINTENANCE`) and a
recommended Hermes skill that already knows how to handle it.

## When to Use

- You want Hermes to tell you what to work on instead of guessing.
- You are returning to a project after a break and need a quick “where do I
  pick up?” view.
- You maintain a `PROJECT_STATUS.md` / `ROADMAP.md` and want the agent to
  honour it without you re‑stating priorities.

## When NOT to Use

- The project has none of the planning files and you don’t want to create one —
  the skill will fall back to git log + Honcho facts only.
- You need a *deep* architectural review (use the `plan` skill instead).

## Prerequisites

- One of `PROJECT_STATUS.md`, `ROADMAP.md`, or `TECH_DEBT.md` in the repo root
  (optional but improves suggestion quality).
- A reachable Honcho instance so the skill can read recent conclutions.
- `git` on `PATH` so the script can read the last commits.

## How to Run

```bash
# Manual one-off suggestion
bash skills/devops/hermes-strategist/scripts/strategist.sh --once

# Daemonised (default 3600 s; override with --interval)
bash skills/devops/hermes-strategist/scripts/strategist.sh --interval 1800
```

## Quick Reference

| Task | Command |
|------|---------|
| Get a one‑off suggestion | `bash scripts/strategist.sh --once` |
| Custom interval | `bash scripts/strategist.sh --interval 1800` |
| Trigger from chat | `/strategize` (if the plugin is loaded) |
| View the last proposal | `hermes honcho search "STRATEGIST:"` |

## Procedure

1. **Gather context** (the helper script does this for you):
   - `read_file` on each of `PROJECT_STATUS.md`, `ROADMAP.md`, `TECH_DEBT.md`
     if present.
   - Last 3 commits via `git log -n 3 --oneline`.
   - Last 10 Honcho conclutions via `hermes honcho search "" --limit 10`.
2. **Prioritise** into three buckets: **CRITICAL** (failing gates, blocked PRs,
   recent errors), **STRATEGIC** (in‑progress / next items in the planning
   files), **MAINTENANCE** (tech debt entries).
3. **Formulate** exactly **three** goal strings in the format
   `[PRIORITY] Goal Name: "description" → Suggested Skill: <skill-name>`.
4. **Post** the three strings to the Hermes debug pane (via Honcho
   conclution) and end with
   `Would you like me to execute any of these now? (reply with the number)`.
5. **Sleep** `interval_seconds` (default 3600) and repeat — or exit after one
   cycle with `--once`.

## Pitfalls

- **Repo has no planning files** → the script will only use git + Honcho
  context, which often yields less specific goals. Create a 5‑line
  `PROJECT_STATUS.md` to unlock better suggestions.
- **Honcho endpoint down** → the script logs a warning and skips Honcho
  lookup; it will still try the planning files + git.
- **Skill name typo** → if a suggested skill is not installed, the user
  will get a “skill not found” error. Keep the suggestions tied to skills
  you actually have.

## Verification

Run the script and confirm a conclution like:

```
[STRATEGIST] (1) [CRITICAL] Fix hydration error: "Next.js /dashboard build
fails because window is referenced server-side." → Suggested Skill:
debugging-and-error-recovery
```

Then reply `1` in the chat and Hermes will route to that skill automatically.
