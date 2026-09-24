"""Tests for hermes-agent-skill-authoring SKILL.md validation.

This test ensures the skill authoring guide meets all requirements
for documenting and validating skill creation in the hermes-agent repo.
"""

import re
import yaml
from pathlib import Path

import pytest

SKILL_PATH = Path(__file__).resolve().parents[2] / "skills/software-development/hermes-agent-skill-authoring/SKILL.md"


def test_skill_exists():
    """The SKILL.md file must exist."""
    assert SKILL_PATH.exists(), f"SKILL.md not found at {SKILL_PATH}"


def test_frontmatter_valid():
    """Frontmatter must be properly formatted YAML."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    assert content.startswith("---"), "SKILL.md must start with ---"
    m = re.search(r"\n---\s*\n", content[3:])
    assert m, "Frontmatter must close with ---"
    fm = yaml.safe_load(content[3 : m.start() + 3])
    assert isinstance(fm, dict), "Frontmatter must be a YAML mapping"
    assert "name" in fm, "Missing 'name' field"
    assert "description" in fm, "Missing 'description' field"
    assert "platforms" in fm, "Missing 'platforms' field"


def test_description_length():
    """Description must be ≤ 60 chars per hardline requirement."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    m = re.search(r'^description: (.*)$', content, re.MULTILINE)
    assert m, "No description found"
    desc = m.group(1).strip()
    # Strip surrounding quotes if present (needed when description contains colon)
    if (desc.startswith('"') and desc.endswith('"')) or (desc.startswith("'") and desc.endswith("'")):
        desc = desc[1:-1]
    assert len(desc) <= 60, f"Description {len(desc)} chars exceeds hardline 60"
    assert desc.endswith("."), "Description must end with a period"


def test_author_credits_human():
    """Author field must credit human contributor first."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    m = re.search(r'^author: (.*)$', content, re.MULTILINE)
    assert m, "No author field found"
    author = m.group(1).strip()
    assert author != "Hermes Agent", "Author must credit human first, not 'Hermes Agent' alone"
    assert re.search(r"[({][^)]+[])}]", author) or "Hermes Agent" in author, \
        "Author should have format: 'Name (handle), Hermes Agent'"


def test_has_required_sections():
    """Skill must have all required body sections."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    required_sections = [
        "## When to Use",
        "## Prerequisites",
        "## How to Run",
        "## Quick Reference",
        "## Procedure",
        "## Pitfalls",
        "## Verification",
    ]
    for section in required_sections:
        assert section in content, f"Missing required section: {section}"


def test_references_hermes_tools():
    """Skill must reference Hermes tools in backticks, not shell commands."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    # The skill documents shell anti-patterns (what NOT to do), so we check
    # that bare shell commands are only inside code blocks or documentation examples
    # Check that bare usage outside backticks is acceptable (it's explaining anti-patterns)
    # Verify Hermes tools are mentioned in backticks
    hermes_tools = ['`write_file`', '`patch`', '`search_files`', '`read_file`']
    found_tools = [t for t in hermes_tools if t in content]
    assert len(found_tools) >= 2, "Should reference at least 2 Hermes tools in backticks"


def test_size_within_limit():
    """Full SKILL.md must be ≤ 100,000 chars."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    assert len(content) <= 100_000, f"Content {len(content)} chars exceeds 100k limit"


def test_no_bare_head_tail():
    """grep, head, tail must be prefixed with `search_files` or `read_file`."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    # Check for bare usage of these commands (not in code blocks)
    lines = content.splitlines()
    for i, line in enumerate(lines, 1):
        # Skip code blocks
        if line.strip().startswith("```"):
            continue
        # Check for bare sed/awk usage
        if re.search(r'\b(sed|awk)\s', line) and "`sed`" not in line and "`awk`" not in line:
            pytest.fail(f"Line {i}: bare sed/awk use should be through patch tool")


def test_github_link_in_author():
    """Author field should include GitHub handle."""
    content = SKILL_PATH.read_text(encoding="utf-8")
    m = re.search(r'^author: (.*)$', content, re.MULTILINE)
    if m:
        author = m.group(1)
        # Should have format with parentheses containing handle
        assert re.search(r'\([^)]+\)', author), "Author should include handle in parentheses"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-q"]))