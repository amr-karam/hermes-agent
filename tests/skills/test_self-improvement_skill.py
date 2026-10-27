"""Contract: the self-improvement skill ships with valid frontmatter and resolves in the skill tree."""

from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
SKILL_MD = REPO_ROOT / "skills" / "software-development" / "self-improvement" / "SKILL.md"


def _frontmatter() -> dict[str, str]:
    """Parse the SKILL.md YAML frontmatter block without any YAML dependency."""
    text = SKILL_MD.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        pytest.fail(f"{SKILL_MD.relative_to(REPO_ROOT)} missing YAML frontmatter block")
    end = text.index("\n---\n", 4)
    fields: dict[str, str] = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip().strip('"')
    return fields


def test_self_improvement_skill_skr_file_exists():
    """The self-improvement skill ships as a bundled skill under skills/software-development/."""
    assert SKILL_MD.is_file(), f"missing SKILL.md: {SKILL_MD.relative_to(REPO_ROOT)}"


def test_self_improvement_frontmatter_name_and_description():
    """Frontmatter name is `self-improvement` and description is one sentence ≤60 chars ending in period."""
    fm = _frontmatter()
    assert fm.get("name") == "self-improvement", f"unexpected name: {fm.get('name')!r}"
    desc = fm.get("description", "")
    assert desc.endswith("."), "description must end with a period"
    assert len(desc) <= 60, f"description exceeds 60 chars ({len(desc)}): {desc!r}"
    # One sentence: no internal period before the final one.
    assert desc.count(".") == 1, f"description must be a single sentence: {desc!r}"
    assert " powerf" not in desc.lower(), "description must not use marketing words"


def test_self_improvement_author_credits_human_first():
    """Author credits the human first, 'Hermes Agent' second — never Hermes Agent alone."""
    fm = _frontmatter()
    author = fm.get("author", "")
    assert "Hermes Agent" in author, f"author must credit Hermes Agent: {author!r}"
    assert not author.strip() == "Hermes Agent", "author must credit a human first, not Hermes Agent alone"


def test_self_improvement_platforms_cross_platform():
    """platforms includes all three OSes — self-improvement is host-agnostic."""
    fm = _frontmatter()
    platforms = fm.get("platforms", "")
    for spec in ("linux", "macos", "windows"):
        assert spec in platforms, f"platforms missing {spec}: {platforms!r}"


def test_self_improvement_related_skills_resolve():
    """related_skills reference skills that actually ship in the repo."""
    fm = _frontmatter()
    related_raw = fm.get("related_skills", "")
    related = [s.strip().strip("[]") for s in related_raw.split(",") if s.strip()]
    for skill in related:
        assert any(
            p.is_file() for p in REPO_ROOT.glob(f"skills/*/{skill}/SKILL.md")
        ), f"related skill not shipped: {skill!r}"


def test_self_improvement_body_has_required_sections():
    """Body follows modern section order: intro, When to Use, Prerequisites, How to Run, Quick Reference, Procedure, Pitfalls, Verification."""
    text = SKILL_MD.read_text(encoding="utf-8")
    required = [
        "# Self-Improvement Skill",
        "## When to Use",
        "## Prerequisites",
        "## How to Run",
        "## Quick Reference",
        "## Procedure",
        "## Pitfalls",
        "## Verification",
    ]
    for section in required:
        assert section in text, f"missing required section: {section}"
