#!/usr/bin/env python3
"""
Test script to verify CRITICAL rules are enforced across all agent systems.
This test ensures agents never tell users to do manual work and always plan before code changes.
"""

import json
import re
from pathlib import Path

def test_critical_rules_in_file(file_path):
    """Test that a file contains both CRITICAL rules."""
    try:
        content = file_path.read_text(encoding='utf-8', errors='replace')
        
        rule1_present = "CRITICAL RULE: NEVER Tell User to Do Anything Manually" in content
        rule2_present = "SECOND CRITICAL RULE: Make a Concise Implementation Plan Before Changing Code" in content
        
        return rule1_present and rule2_present, []
    except Exception as e:
        return False, [f"Error reading {file_path}: {e}"]

def test_openai_yaml_files():
    """Test all openai.yaml agent config files."""
    errors = []
    tested = 0
    
    # Test hexastudio.net skills
    hexa_base = Path(r"C:\Users\amrmo\OneDrive\Desktop\hexastudio.net\skills")
    if hexa_base.exists():
        for yaml_file in hexa_base.rglob("**/agents/openai.yaml"):
            tested += 1
            passed, file_errors = test_critical_rules_in_file(yaml_file)
            if not passed:
                errors.extend(file_errors)
            if not passed and ("CRITICAL RULE: NEVER Tell User to Do Anything Manually" not in yaml_file.read_text(encoding='utf-8', errors='replace')):
                errors.append(f"Missing rule 1 in {yaml_file}")
            if not passed and ("SECOND CRITICAL RULE: Make a Concise Implementation Plan" not in yaml_file.read_text(encoding='utf-8', errors='replace')):
                errors.append(f"Missing rule 2 in {yaml_file}")
    
    # Test hermes-agent skills
    hermes_base = Path(r"C:\Users\amrmo\workspace\hermes-agent\apps\desktop\src\app\skills")
    if hermes_base.exists():
        for yaml_file in hermes_base.rglob("**/agents/openai.yaml"):
            tested += 1
            passed, file_errors = test_critical_rules_in_file(yaml_file)
            if not passed:
                errors.extend(file_errors)
            if not passed and ("CRITICAL RULE: NEVER Tell User to Do Anything Manually" not in yaml_file.read_text(encoding='utf-8', errors='replace')):
                errors.append(f"Missing rule 1 in {yaml_file}")
            if not passed and ("SECOND CRITICAL RULE: Make a Concise Implementation Plan" not in yaml_file.read_text(encoding='utf-8', errors='replace')):
                errors.append(f"Missing rule 2 in {yaml_file}")
    
    return tested, errors

def test_agents_md_files():
    """Test AGENTS.md files."""
    errors = []
    tested = 0
    
    agents_files = [
        Path(r"C:\Users\amrmo\OneDrive\Desktop\hexastudio.net\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\agent\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\cron\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\gateway\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\hermes_cli\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\apps\desktop\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\apps\desktop\src\AGENTS.md"),
        Path(r"C:\Users\amrmo\workspace\hermes-agent\apps\desktop\src\app\skills\vercel-react-best-practices\AGENTS.md"),
    ]
    
    for file_path in agents_files:
        if file_path.exists():
            tested += 1
            passed, file_errors = test_critical_rules_in_file(file_path)
            if not passed:
                errors.extend(file_errors)
            # These files might have different formatting, so let's check with regex
            content = file_path.read_text(encoding='utf-8', errors='replace')
            rule1_present = bool(re.search(r"CRITICAL RULE.*NEVER.*tell.*user.*do.*anything.*manually|NEVER.*TELL USER TO DO ANYTHING MANUALLY|do anything manually", content, re.IGNORECASE))
            rule2_present = bool(re.search(r"CRITICAL RULE.*IMPLEMENTATION PLAN.*BEFORE CHANGING CODE|MAKE A CONCISE IMPLEMENTATION PLAN BEFORE CHANGING CODE", content, re.IGNORECASE))
            if not (rule1_present and rule2_present):
                errors.append(f"Rules not found in proper format in {file_path}")
    
    return tested, errors

def main():
    print("Testing CRITICAL Rules Compliance")
    print("=" * 50)
    
    # Test openai.yaml files
    print("\n[1] Testing agent config files (openai.yaml)...")
    yaml_tested, yaml_errors = test_openai_yaml_files()
    print(f"   Tested: {yaml_tested} files")
    if yaml_errors:
        print("   ❌ ERRORS:")
        for error in yaml_errors[:5]:  # Show first 5 errors
            print(f"      - {error}")
        if len(yaml_errors) > 5:
            print(f"      ... and {len(yaml_errors) - 5} more")
    else:
        print("   [OK] All files contain both CRITICAL rules")
    
    # Test AGENTS.md files
    print("\n[2] Testing AGENTS.md files...")
    md_tested, md_errors = test_agents_md_files()
    print(f"   Tested: {md_tested} files")
    if md_errors:
        print("   [ERROR] ERRORS:")
        for error in md_errors[:5]:
            print(f"      - {error}")
        if len(md_errors) > 5:
            print(f"      ... and {len(md_errors) - 5} more")
    else:
        print("   [OK] All files contain both CRITICAL rules")
    
    # Summary
    total_tested = yaml_tested + md_tested
    total_errors = len(yaml_errors) + len(md_errors)
    
    print("\n" + "=" * 50)
    print("[Summary] {} files tested, {} errors found".format(total_tested, total_errors))
    
    if total_errors == 0:
        print("SUCCESS: All CRITICAL rules are properly enforced!")
        return 0
    else:
        print("WARNING: Some files are missing CRITICAL rules")
        return 1

if __name__ == "__main__":
    exit(main())