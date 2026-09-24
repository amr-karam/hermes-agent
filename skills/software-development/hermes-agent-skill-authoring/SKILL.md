---
name: hermes-agent-skill-authoring
description: "Author in-repo SKILL.md files: frontmatter and structure."
version: 2.1.0
author: Amr Mohamed (amrmo), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [skills, authoring, hermes-agent, conventions, skill-md]
    related_skills: [requesting-code-review]
---

# Authoring Hermes-Agent Skills (in-repo)

Guide for committing reusable agent workflows as in-repo SKILL.md files that meet the
repo's hardline authoring standards. Covers frontmatter, platform gating, body structure,
tests, docs generation, and common pitfalls that cause PR rejection. Not for personal
`~/.hermes/skills/` files — use `skill_manage` instead.

## When to Use

- User asks you to add a skill "in this branch / repo / commit"
- You're committing a reusable workflow that should ship with hermes-agent
- You're editing an existing skill under `skills/` or `optional-skills/` (use `patch` for
  small edits, `write_file` for rewrites; `skill_manage` still works for patch on in-repo
  skills, but not for `create`)
- Don't use for: personal skills in `~/.hermes/skills/` (just use `skill_manage`)

## Prerequisites

- Access to a checkout of the `hermes-agent` repository
- Python 3 with `yaml` available (`pip install pyyaml`)
- `search_files` to locate peer skills and verify category names
- `write_file` and `patch` for creating/editing SKILL.md files

No credentials are needed for bundled skills (which ship inactive by default or are always
available). Optional skills may require their own env vars — document those in `## Prerequisites`
inside their SKILL.md.

## How to Run

The canonical invocation is `write_file` to the skill path — this is the standard tool the agent
uses every time:

```
write_file(
  filePath: "skills/<category>/<name>/SKILL.md",
  content: "<frontmatter + body>"
)
```

For small fixes to an existing in-repo skill:

```
patch(
  filePath: "skills/<category>/<name>/SKILL.md",
  oldString: "<existing text>",
  newString: "<replacement text>"
)
```

For personal (user-local) skills under `~/.hermes/skills/`, use the dedicated tool instead:

```
skill_manage(action="create", name="<name>", description="...")
```

## Quick Reference

```bash
# Validate frontmatter locally
python -c "import yaml,re,pathlib; ..."

# Run the skill's own test
bash scripts/run_tests.sh tests/skills/test_<skill>_skill.py -q

# Regenerate docs (runs the generator, applies scope discipline)
python website/scripts/generate-skill-docs.py

# Verify sidebar has exactly one entry for your slug
grep '<your-slug>' website/sidebars.ts    # expect exactly one hit
```

## Decide the Tier First: Bundled vs Optional

- **Bundled (`skills/<category>/`)** — daily-driver behavior, broadly useful across many user
  types, low footprint. Hard bar: you can say "a user will load this in 5+ sessions per month"
  with a straight face.
- **Optional (`optional-skills/<category>/`)** — niche, vertical-specific (blockchain, gaming,
  finance, one app), recurring-job/task skills, or anything heavy. Installed via
  `hermes skills install official/<category>/<skill>`.

**When in doubt, optional.** Promoting later is easy; demoting is churn. "Would be useful to
anyone who ever needs this" is an optional-tier argument, not a bundled one.

Pick the category by what the tool IS, not what it feels like (an AI-agent CLI goes in
`autonomous-ai-agents/` even if it "feels productivity"). Confirm existing categories with
`search_files(pattern='*', target='files', path='skills')` and don't invent new top-level
categories casually.

**No router / index / hub skills.** A skill whose core content is a routing table pointing at
sibling skills adds an indirection hop and duplicates the siblings' own `When to Use` triggers.
If the skill would be empty without "load skill X instead" pointers, don't write it — the
catalog and each sibling's triggers already do that job.

## Required Frontmatter

Validator source of truth: `tools/skill_manager_tool.py::_validate_frontmatter`. Validator
hard requirements:

- Starts with `---` as the first bytes (no leading blank line or BOM).
- Closes with `\n---\n` before the body.
- Parses as a YAML mapping.
- `name` field present.
- `description` field present.
- Non-empty body after the closing `---`.

Repo-standard shape (all fields expected, even where the validator doesn't enforce them):

```yaml
---
name: my-skill-name               # lowercase, hyphens, ≤64 chars (MAX_NAME_LENGTH)
description: Concise capability statement, under sixty chars.
version: 0.1.0                    # semver; new skills start at 0.1.0
author: Real Name (github-handle), Hermes Agent
license: MIT
platforms: [linux, macos, windows]   # audit, don't guess — see Platform Gating
metadata:
  hermes:
    tags: [Short, Descriptive, Tags]
    related_skills: [other-in-repo-skill]
---
```

### `description` rules (HARDLINE — the validator's 1024-char ceiling is NOT the standard)

- **≤ 60 characters.** One sentence. Ends with a period.
- State the capability, not the implementation, and don't repeat the skill name.
- No marketing words ("powerful", "comprehensive", "seamless", "advanced").
- The system prompt skill index truncates at 57 chars + "..." — the trigger/capability must be
  self-contained in that window.
- If the description contains a `:`, wrap it in double quotes or YAML parses it as a mapping
  and the docs generator crashes. Quotes don't count toward the 60.

Good: `Track named companies for material news with cited digests.`
Bad: `Use when a user asks to monitor named competitors or companies for product launches, pricing changes, funding, ...` (240 chars — rejected in review)

### `author` rules

- Credit the **human first**, then "Hermes Agent" as secondary collaborator:
  `Ben Barclay (benbarclay), Hermes Agent`.
- Never `author: Hermes Agent` alone for contributed skills — credit the human, not the tool,
  even (especially) when an agent drafted the text.
- Maintainer-authored skills: `Teknium (teknium1), Hermes Agent`.

### `related_skills` rules

- Every entry must resolve to an existing **in-repo** skill in the same tree state as your PR.
  Do not reference skills that were only planned, live in another PR, or exist only in
  `~/.hermes/skills/`.
- Verify each entry: `search_files(pattern='<name>', target='files', path='skills')` (and
  `optional-skills/`).

## Platform Gating: audit, don't trust

`platforms:` gates loading by host OS. Set it from what the skill's prose and scripts actually
invoke:

| Skill uses only… | `platforms:` |
|---|---|
| Hermes tools + stdlib Python + cross-platform CLIs | `[linux, macos, windows]` |
| bash pipelines, `grep`/`awk`/`sed` chains, heredocs | `[linux, macos]` |
| `osascript`, `defaults`, `pmset` | `[macos]` |
| `apt`/`systemctl`/`/proc` | `[linux]` |

<!-- no-tmp: ok — names the anti-pattern skill authors must avoid -->
POSIX-only signals to search for in `scripts/`: `fcntl`, `termios`, `pty`, `os.fork`,
`os.killpg`, `signal.SIGKILL`, `os.kill(pid, 0)` liveness checks, hardcoded `/tmp` `/proc`
`/etc`. Default posture: fix cross-platform first (`tempfile.gettempdir()`, `pathlib.Path`,
`psutil.pid_exists`); gate narrower only when the dependency is genuinely platform-bound, and
say why in `## Pitfalls`.

## Size Limits

- Full SKILL.md: ≤ 100,000 chars enforced (`MAX_SKILL_CONTENT_CHARS`), but target **~100 lines
  for a simple skill, ~200 for a complex one**. Peer skills sit at 8-14k chars.
- Bulky or branch-specific material goes in `references/*.md`, `templates/`, or `scripts/` —
  pointed to from SKILL.md, not inlined.
- Don't expect the model to inline-write parsers or non-trivial logic every call — ship a helper
  script in `scripts/` and reference it by path.

## Body Structure (modern section order)

```
# <Skill> Skill
2-3 sentence intro: what it does, what it doesn't do, dependency stance.

## When to Use          — bulleted triggers (+ "Don't use for:" counter-triggers)
## Prerequisites        — exact env vars, installs, API key sourcing
## How to Run           — canonical invocation through the `terminal` tool
## Quick Reference      — flat command list, no narration
## Procedure            — numbered steps, each with a checkable completion criterion
## Pitfalls             — known limits, things that look broken but aren't
## Verification         — how to prove the skill worked
```

Not every section applies to every skill (a pure-procedure task skill may have no Quick
Reference), but When to Use + actionable body + Pitfalls + Verification are the minimum. Cut
marketing intros, "Setup Check" no-ops, and re-explanations of env vars already in
Prerequisites.

### Reference Hermes tools, not raw shell

When the skill needs a capability, name the proper Hermes tool in backticks: `terminal`,
`read_file`, `write_file`, `patch`, `search_files`, `web_search`, `web_extract`,
`browser_navigate`, `vision_analyze`, `delegate_task`, `cronjob`. Do NOT name shell utilities
the agent already has wrapped (`grep` → `search_files`, `cat` → `read_file`, `sed`/`awk` →
`patch`, `find`/`ls` → `search_files target='files'`). A CLI-wrapper skill should frame
invocations as `terminal(command="<tool> ...", timeout=...)` — bare shell prose ("run
`foo --version`") is a review-blocking non-conformance. If the skill depends on an MCP server,
name it and document setup in Prerequisites.

### Never use machine-local paths

Write repo-relative paths (`skills/...`, `tools/skill_manager_tool.py`). A `/home/<you>/...`
path baked into a committed skill breaks for every other user and is an instant review flag.

## Writing Quality Principles

A skill exists to make the agent's process more predictable — the agent reliably follows the
same useful discipline.

1. **Optimize for process predictability.** If a line does not change behavior, cut it.
2. **Choose the right context load.** The description is paid for every turn; details go in
   the body or linked references.
3. **End steps with completion criteria.** Checkable and, when it matters, exhaustive: "every
   modified file accounted for" beats "summarize changes."
4. **Co-locate rules with the concept they govern.**
5. **Use strong leading words** ("tight loop," "root cause," "regression test") over long
   repeated explanations.
6. **Prune duplication and no-ops.** "Be careful" and "use best practices" don't change model
   behavior — replace with a checkable criterion or delete.

## Procedure

1. **Survey peers** in the target category with `search_files(target='files',
   path='skills')` and read 2-3 peer SKILL.md files to match tone and structure. Prefer
   extending an existing skill over creating a narrow sibling.
   - Completion check: at least 3 peer SKILL.md files read in the target category.

2. **Decide tier and category** (see `## Decide the Tier First`). When in doubt, optional —
   and ask before pushing rather than defaulting.
   - Completion check: directory confirmed as either `skills/<category>/` or
     `optional-skills/<category>/` with category verified against existing siblings.

3. **Draft** with `write_file` to `skills/<category>/<name>/SKILL.md` (or
   `optional-skills/...`).
   - Completion check: file written with frontmatter starting at byte 0.

4. **Validate locally** before committing:
   ```python
   import yaml, re, pathlib
   content = pathlib.Path("skills/<category>/<name>/SKILL.md").read_text()
   assert content.startswith("---")
   m = re.search(r'\n---\s*\n', content[3:])
   fm = yaml.safe_load(content[3:m.start()+3])
   assert "name" in fm and "description" in fm
   assert len(fm["description"]) <= 60, f"description {len(fm['description'])} chars — hardline is 60"
   assert fm["description"].endswith(".")
   assert "platforms" in fm
   assert len(content) <= 100_000
   ```
   Also verify every `related_skills` entry exists in-repo.
   - Completion check: all assertions pass; all related_skills resolve.

5. **Add tests + regen docs** (see `## Tests and Docs`).
   - Completion check: test file exists at
     `tests/skills/test_<skill>_skill.py`; docs generated and diff scoped.

6. **Git add + commit** on the active branch; open a PR.
   - Completion check: `git diff --staged` shows only the new SKILL.md, test file, and docs
     changes.

7. **Note:** the CURRENT session's skill loader is cached — `skill_view` / `skills_list`
   will not see the new skill until a new session. This is expected, not a bug.

## Editing Existing In-Repo Skills

- **Small fix:** `skill_manage(action='patch', ...)` works on in-repo skills, as does `patch`.
- **Major rewrite:** `write_file` the whole SKILL.md.
- **Supporting files:** `write_file` to `references/`, `templates/`, or `scripts/` under
  the skill dir.
- **Always commit** — in-repo skills are source, not runtime state. Re-run the docs generator
  when frontmatter changed.

## Tests and Docs (required for repo skills)

1. **Tests** live at `tests/skills/test_<skill>_skill.py` — stdlib + pytest +
   `unittest.mock` only, no live network. Run via
   `bash scripts/run_tests.sh tests/skills/test_<skill>_skill.py -q`. (The generic
   `tests/tools/test_skill_manager_tool.py` passing proves nothing about YOUR skill.)

2. **Docs regen:** run `python website/scripts/generate-skill-docs.py`, then apply scope
   discipline — the generator rewrites EVERY auto-gen page. `git checkout --` everything that
   isn't yours; the final diff must show only your SKILL.md, your one per-skill docs page, a
   one-line catalog row, and a one-line `website/sidebars.ts` insertion (verify with
   `search_files(pattern='<your-slug>', path='website/sidebars.ts')` — exactly one hit, or the
   page is an orphan).

3. **`.env.example`** (only if the skill needs new env vars): one clearly delimited commented
   block; touch nothing else in the file.

## Common Pitfalls

1. **Using `skill_manage(action='create')` for an in-repo skill.** It writes to
   `~/.hermes/skills/`, not the repo tree. Use `write_file`.
2. **Trusting the validator's limits as the standard.** The validator allows 1024-char
   descriptions; review rejects anything over 60. The validator doesn't check `platforms:`,
   author format, tests, or docs — review does.
3. **`author: Hermes Agent` on a contributed skill.** Credit the human first.
4. **Leading whitespace before `---`.** Validation fails on any leading blank line or BOM.
5. **Description too generic or trigger buried past char 57.**
6. **`related_skills` pointing at skills that don't exist in-repo** (user-local, planned, or
   in a sibling PR).
7. **Duplicating a peer.** Survey the category first; extend rather than sibling.
8. **Skipping the docs generator or pushing its unrelated drift.** Both directions are wrong:
   no regen = orphan skill with no docs page; blind regen = a ballooned diff full of other
   skills' drift.
9. **Expecting the current session to see the new skill.** The loader is initialized at
   session start.
10. **Letting skills accumulate sediment.** When adding a rule, remove the old wording it
    replaces.

## Pitfalls

- **Description with a colon.** If your description contains `:`, the YAML parser treats it
  as a mapping. Wrap the value in quotes: `description: "Author in-repo skills: frontmatter."`
- **CI-only path divergence.** The docs generator, test suite, and validator may diverge
  slightly — always run all three locally before pushing.
- **Frontmatter vs body bleed.** Ensure the closing `---` is followed by exactly one blank
  line before the first heading.
- **Category drift.** If a new top-level directory is needed (e.g. `skills/blockchain/`),
  verify it is approved — unrequested new categories are rejected in review.

## Verification

1. **Frontmatter validation:** Run the inline Python check in `## Procedure` step 4 — all
   assertions pass, no errors.
2. **Description check:** `len(description) <= 60`, ends with `.`.
3. **Related skills check:** Every `related_skills` entry resolves to an in-repo skill.
4. **Test pass:** `bash scripts/run_tests.sh tests/skills/test_<skill>_skill.py -q` exits 0.
5. **Docs scoped:** `git diff` after `generate-skill-docs.py` shows only your skill's
   changes; `website/sidebars.ts` has exactly one new entry with your slug.
6. **No machine paths:** `search_files(pattern='/home/|C:\\\\', path='skills/<category>/<name>/')`
   returns zero hits.

## Verification Checklist

- [ ] Tier decided deliberately (bundled bar: 5+ sessions/month; else `optional-skills/`)
- [ ] File at `skills/<category>/<name>/SKILL.md` or `optional-skills/<category>/<name>/SKILL.md`
- [ ] Frontmatter starts at byte 0 with `---`, closes with `\n---\n`
- [ ] `name`, `description`, `version`, `author`, `license`, `platforms`,
      `metadata.hermes.{tags, related_skills}` all present
- [ ] Description ≤ 60 chars, one sentence, ends with a period, no marketing words
- [ ] `author` credits the human contributor first
- [ ] `platforms:` audited against actual prose/scripts, not copied from a sibling
- [ ] Every `related_skills` entry resolves in-repo
- [ ] Body follows the modern section order; commands framed through Hermes tools
- [ ] No machine-local paths anywhere in the file
- [ ] Each ordered step has a checkable completion criterion
- [ ] Tests at `tests/skills/test_<skill>_skill.py` pass under `scripts/run_tests.sh`
- [ ] Docs regenerated with scope discipline; sidebar has exactly one entry for the slug
- [ ] `git add` + commit on the intended branch; PR opened
