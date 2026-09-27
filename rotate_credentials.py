#!/usr/bin/env python3
"""Rotate 7 exposed provider credentials using credential_lifecycle functions."""

import os
import sys
sys.path.insert(0, r"C:\Users\amrmo\workspace\hermes-agent")

from hermes_cli.credential_lifecycle import (
    save_provider_env_credential,
    remove_provider_env_credential,
    purge_env_credential_references,
)

# The 7 exposed provider environment variables to rotate
EXPOSED_ENV_VARS = [
    "OPENROUTER_API_KEY",
    "KILOCODE_API_KEY", 
    "GOOGLE_API_KEY",
    "GEMINI_API_KEY",
    "LM_API_KEY",
    "OPENCODE_GO_API_KEY",
    "FREETHEAI_API_KEY",  # Possible "Meta" reference
]

# Also check for Context7 - might be a plugin env var
CONTEXT7_VARS = ["CONTEXT7_API_KEY", "CONTEXT7_KEY"]

def check_current_values():
    """Check current values in .env files."""
    from hermes_cli.config import load_env
    
    env = load_env()
    print("=== Current .env values ===")
    for var in EXPOSED_ENV_VARS + CONTEXT7_VARS:
        val = env.get(var)
        if val:
            masked = val[:8] + "..." + val[-4:] if len(val) > 12 else "***"
            print(f"  {var} = {masked}")
        else:
            print(f"  {var} = (not set)")

def remove_all_exposed():
    """Remove all exposed credentials from every store."""
    print("\n=== Removing exposed credentials ===")
    for var in EXPOSED_ENV_VARS + CONTEXT7_VARS:
        print(f"\nRemoving {var}...")
        try:
            result = remove_provider_env_credential(var)
            print(f"  Result: {result}")
        except Exception as e:
            print(f"  Error: {e}")

def save_new_credentials(new_values: dict):
    """Save new credential values."""
    print("\n=== Saving new credentials ===")
    for var, value in new_values.items():
        if value:
            print(f"\nSaving {var}...")
            try:
                result = save_provider_env_credential(var, value)
                print(f"  Result: {result}")
            except Exception as e:
                print(f"  Error: {e}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Rotate exposed provider credentials")
    parser.add_argument("--check", action="store_true", help="Check current values only")
    parser.add_argument("--remove", action="store_true", help="Remove all exposed credentials")
    parser.add_argument("--save", nargs="*", help="Save new values as KEY=VALUE pairs")
    args = parser.parse_args()

    if args.check:
        check_current_values()
    elif args.remove:
        remove_all_exposed()
    elif args.save:
        new_values = {}
        for pair in args.save:
            if "=" in pair:
                k, v = pair.split("=", 1)
                new_values[k] = v
        save_new_credentials(new_values)
    else:
        check_current_values()
        print("\nUsage:")
        print("  python rotate_credentials.py --check")
        print("  python rotate_credentials.py --remove")
        print("  python rotate_credentials.py --save OPENROUTER_API_KEY=newkey KILOCODE_API_KEY=newkey")

if __name__ == "__main__":
    main()