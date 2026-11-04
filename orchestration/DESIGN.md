# Hermes Rig — orchestration package design

Build the `orchestration/` package at the repo root so that
`hermes_cli.subcommands.rig` and `hermes_cli.web_routers.rig` import and run.

## Modules
- `orchestration/__init__.py`
- `orchestration/paths.py` — `resolve_root(project_root=None)`, `resolve_project_name(project_name=None)`
- `orchestration/llm_client.py` — `LLMUnavailableError`, `LLMOutputError`, `LLMClient`
- `orchestration/workspace.py` — `WorkspaceManager(root, proj, read_only=False)`
- `orchestration/slicer.py` — `SlicingAgent` (goal -> slices)
- `orchestration/rig_controller.py` — `RigController(root, proj, read_only=False)` with `.wm`

## Workspace layout (file-based, durable)
```
<root>/hermes-rig-workspaces/<proj>/
  missions/
    <mission_id>/
      SPEC.md      mission goal/spec
      state.json   {id, status, progress, goal, created_at}
      slices.json  [{id, title, owner, status, is_risky, approved, created_at}]
      log.jsonl    {"ts","event"} lines
```
`mission_id` = `rig-YYYYMMDD-<6 hex>` (e.g. `rig-20261104-a1b2c3`).

## WorkspaceManager API
- `get_all_missions() -> [{id, status, progress, goal}]`
- `create_mission(goal) -> mission_id`
- `get_mission(mission_id) -> dict`
- `set_approved(mission_id, slice_id, approved: bool) -> None` — raises `ValueError`/`FileNotFoundError` if missing
- `update_slice_state(mission_id, slice_id, state) -> None`
- `get_paused_slices(mission_id) -> [dict]`
- `get_slice_report(mission_id) -> [dict]` — keys `id, status, owner, is_risky, approved, title`
- `read_log(mission_id) -> [dict]` — keys `ts, event`
- `get_active_slices(mission_id) -> [dict]` — slices whose status is not `completed`/`failed`

## RigController API
- `up(seats, mission_id=None, test_command=None)` — boot seats into tmux sessions `hermes-{seat}`
- `ps()` — print seat status
- `down()` — terminate all seat tmux sessions
- `run(request, resume=None, force_new=False) -> dict` — `{status, summary, tier, tasks_output}`
- `run_async(task) -> dict` — async wrapper around `run(task)`
- `_session_exists(session_name) -> bool` — tmux session presence

## Seats
`["nexus", "librarian", "builder", "critic", "operator"]`; tmux session `hermes-{seat}`.

## Errors
- `WorkspaceManager` raises `ValueError` / `FileNotFoundError` for missing mission or slice.
- `RigController.run` raises `LLMUnavailableError` / `LLMOutputError` only when a model is required and unavailable.

## Graceful degradation
- `tmux` unavailable: seats reported inactive; `up()` continues without crashing.
- Model unavailable: deterministic slicing, `status == "completed"` (no error unless the model is explicitly required).
