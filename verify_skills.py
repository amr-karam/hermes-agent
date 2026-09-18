import yaml, re
from pathlib import Path

for skill_dir in ["design-process", "icon-design", "illustration"]:
    skill_path = Path(f"skills/creative/{skill_dir}/SKILL.md")
    content = skill_path.read_text(encoding="utf-8")
    fm, _ = content.split("\n---\n", 1)
    fm = yaml.safe_load(fm)
    desc = fm.get("description", "")
    name = fm.get("name", "")
    related = fm.get("metadata", {}).get("hermes", {}).get("related_skills", [])
    print(f"{name}:")
    print(f"  description: {desc} ({len(desc)} chars)")
    print(f"  ends with period: {desc.rstrip().endswith('.')}")
    print(f"  related_skills: {related}")
    print(f"  name matches dir: {name == skill_dir}")
    ml = re.search(r"/home/[a-z0-9_-]+/|[A-Z]:\\+Users\\+", content)
    print(f"  machine-local path: {'FOUND' if ml else 'NONE'}")
    print()