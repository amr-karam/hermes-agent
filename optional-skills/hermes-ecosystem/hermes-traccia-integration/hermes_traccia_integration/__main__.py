"""
Entry point for hermes traccia CLI commands.

Usage:
    hermes run hermes_traccia_cli [command] [options]

Or after installing into skills:
    hermes traccia [command] [options]
"""

import sys
from hermes_traccia_integration.cli import main


def entrypoint():
    """Entry point wrapper."""
    sys.exit(main())


if __name__ == "__main__":
    entrypoint()