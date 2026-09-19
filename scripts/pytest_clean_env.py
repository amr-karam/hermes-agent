"""CI-parity pytest runner: scrub secrets, temp HERMES_HOME, TZ=UTC, run pytest.

Mirrors scripts/run_tests.sh guarantees (credential vars unset, TZ=UTC,
LANG=C.UTF-8, HERMES_HOME -> temp dir). Invoke with system python:
  python C:/Users/amrmo/AppData/Local/Temp/opencode/clean_pytest.py <pytest args>
"""
import os
import subprocess
import sys
import tempfile

SCRUB_SUBSTRINGS = ("API_KEY", "APIKEY", "TOKEN", "SECRET", "PASSWORD", "CREDENTIALS")

env = {k: v for k, v in os.environ.items()
       if not any(s in k.upper() for s in SCRUB_SUBSTRINGS)}
tmp = tempfile.mkdtemp(prefix="hermes_test_home_")
env["HERMES_HOME"] = tmp
env["TZ"] = "UTC"
env["LANG"] = "C.UTF-8"
print(f"[clean_pytest] HERMES_HOME={tmp} scrubbed={len(os.environ) - len(env)}", flush=True)
cmd = [sys.executable, "-m", "pytest", "-p", "no:cacheprovider"] + sys.argv[1:]
proc = subprocess.run(cmd, env=env)
sys.exit(proc.returncode)
