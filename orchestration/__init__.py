"""Hermes Rig orchestration package (the Rig).

A file-backed mission workspace plus goal slicing, tmux seat lifecycle and the
controller that both the CLI ``rig`` subcommand and the dashboard routes drive.
Module map and workspace layout: ``orchestration/DESIGN.md``.

Deliberately import-free: submodules stay cheap to import and cycle-free.
"""
