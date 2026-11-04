"""Hermes Rig orchestration package (the Rig).

A file-backed mission workspace plus goal slicing, tmux seat lifecycle and the
controller that both the CLI ``rig`` subcommand and the dashboard routes drive.
Module map and workspace layout: ``orchestration/DESIGN.md``.

Deliberately import-free: submodules stay cheap to import and cycle-free.

The merged package keeps the local interface contract (matching
``hermes_cli.subcommands.rig`` and ``hermes_cli.web_routers.rig``) while adding
the server's OpenRig enhancements as backward-compatible options: per-slice
risk metadata (dependencies, priority, assigned_agent, risk_reason), bounded
log rotation, goal-based mission dedup (find_open_mission /
find_completed_mission), and per-slice artifact recording. An injected LLM
transport can be wired via :class:`orchestration.llm_client.LLMClient`; the
default deterministic planner needs no model or network.
"""
