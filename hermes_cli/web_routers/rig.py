"""Rig orchestration dashboard routes.

Provides API endpoints for the Hermes Rig orchestration mesh:
- GET  /api/rig/status    - Get the status of all Rig seats
- POST /api/rig/up        - Boot the Rig seats into tmux sessions
- POST /api/rig/down      - Terminate all running Rig seats
- POST /api/rig/run       - Execute a task via the Rig's CrewAI orchestration
- GET  /api/rig/slices    - Get the active slices from the workspace
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse

from hermes_cli.web_deps import LateState, late

_log = logging.getLogger("hermes_cli.web_server")
router = APIRouter()

_late_rig_controller = late("RigController", "orchestration.rig_controller")
_late_workspace = late("WorkspaceManager", "orchestration.workspace")
_late_slicer = late("SlicingAgent", "orchestration.slicer")

app = LateState("app")


def _active_slices(wm, limit: int = 25) -> List[Dict[str, Any]]:
    """Active slices across every Mission, newest first.

    Not `get_active_slices("active-mission")`: T1 gave Missions real minted ids,
    so that literal names nothing and always returned empty. Iterating the
    missions directory is the honest way to ask "what is in flight".
    """
    out: List[Dict[str, Any]] = []
    for mission in wm.get_all_missions():
        try:
            for entry in wm.get_active_slices(mission["id"]):
                out.append({**entry, "mission_id": mission["id"]})
        except ValueError:
            # A malformed id on disk must not take the whole status route down.
            continue
    out.sort(key=lambda s: s["mission_id"])
    return out[:limit]


@router.get("/api/rig/status")
async def rig_status() -> Dict[str, Any]:
    """Get the status of all Rig seats and active slices."""
    try:
        from orchestration.paths import resolve_project_name, resolve_root
        from orchestration.rig_controller import RigController
        from orchestration.workspace import WorkspaceManager

        # resolve_root()/resolve_project_name() rather than a literal: a
        # hardcoded path ignores --project-root, HERMES_RIG_PROJECT, and the cwd
        # the dashboard is actually served from (R6). /api/rig/run already
        # resolved them; these three routes were the stragglers.
        root = resolve_root()
        proj = resolve_project_name()

        # Read-only: this route must not bootstrap a workspace as a side effect.
        controller = RigController(root, proj, read_only=True)
        wm = WorkspaceManager(root, proj, read_only=True)

        seats = ["nexus", "librarian", "builder", "critic", "operator"]
        seat_status = []
        for seat in seats:
            session_name = f"hermes-{seat}"
            is_active = controller._session_exists(session_name)
            seat_status.append({
                "seat": seat,
                "session": session_name,
                "active": is_active,
            })

        slices = _active_slices(wm)

        return {
            "seats": seat_status,
            "slices": slices,
            "total_seats": len(seats),
            "active_seats": sum(1 for s in seat_status if s["active"]),
        }
    except Exception as e:
        _log.error("Error getting Rig status: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/rig/up")
async def rig_up(request: Request) -> Dict[str, Any]:
    """Boot the Rig seats into tmux sessions."""
    try:
        body = await request.json()
        seats = body.get("seats", ["nexus", "librarian", "builder", "critic", "operator"])

        from orchestration.paths import resolve_project_name, resolve_root
        from orchestration.rig_controller import RigController

        controller = RigController(resolve_root(), resolve_project_name())
        controller.up(seats)

        return {"status": "ok", "seats": seats, "message": f"Booted seats: {', '.join(seats)}"}
    except Exception as e:
        _log.error("Error booting Rig seats: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/rig/down")
async def rig_down() -> Dict[str, Any]:
    """Terminate all running Rig seats."""
    try:
        from orchestration.paths import resolve_project_name, resolve_root
        from orchestration.rig_controller import RigController

        controller = RigController(resolve_root(), resolve_project_name())
        controller.down()

        return {"status": "ok", "message": "All seats terminated"}
    except Exception as e:
        _log.error("Error terminating Rig seats: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/rig/run")
async def rig_run(request: Request) -> Dict[str, Any]:
    """Execute a task via the Rig's CrewAI orchestration."""
    try:
        body = await request.json()
        task = body.get("request", "")

        if not task:
            raise HTTPException(status_code=400, detail="request is required")

        from orchestration.rig_controller import RigController
        from orchestration.paths import resolve_root, resolve_project_name
        from orchestration.llm_client import LLMUnavailableError, LLMOutputError

        controller = RigController(resolve_root(), resolve_project_name())
        result = await controller.run_async(task)

        if result.get("status") == "escalated":
            # An escalation is a refusal, not a run. Returning 200/"ok" here made
            # a dashboard render a green tick for work that never happened and
            # never will without a human -- the exact "hallucinated progress"
            # the Rig exists to prevent. 409 rather than 503: the caller cannot
            # retry this away, it needs a person to reword or pre-approve.
            _log.info("Rig run escalated to a human: %s", task)
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "escalated",
                    "task": task,
                    "message": result.get("summary", ""),
                    "tier": result.get("tier"),
                },
            )

        return {"status": "ok", "task": task, "result": result}
    except HTTPException:
        raise
    except (LLMUnavailableError, LLMOutputError) as e:
        # No plan was produced and nothing ran. 503, not 500: the Rig is fine,
        # the provider is not, and the caller may retry.
        _log.warning("Rig run could not plan: %s", e)
        raise HTTPException(status_code=503, detail=f"model unavailable, nothing executed: {e}")
    except Exception as e:
        _log.error("Error running Rig task: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/rig/slices")
async def rig_slices() -> Dict[str, Any]:
    """Get the active slices from the workspace."""
    try:
        from orchestration.paths import resolve_project_name, resolve_root
        from orchestration.workspace import WorkspaceManager

        # Read-only for the same reason as /api/rig/status: a GET that creates
        # the workspace it is reporting on is not a read.
        wm = WorkspaceManager(resolve_root(), resolve_project_name(), read_only=True)
        slices = _active_slices(wm)

        return {"status": "ok", "slices": slices}
    except Exception as e:
        _log.error("Error getting Rig slices: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rig", response_class=HTMLResponse)
async def rig_dashboard() -> str:
    """Serve the Rig orchestration dashboard."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hermes Rig Dashboard</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0e17; color: #e0e6ed; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.header h1 { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.header .badge { background: rgba(96,165,250,0.15); color: #60a5fa; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
.card { background: #111827; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; }
.card h3 { font-size: 14px; color: #94a3b8; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
.seat { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1e293b; }
.seat:last-child { border-bottom: none; }
.seat-name { font-weight: 600; font-size: 15px; }
.seat-status { display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.active { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
.dot.inactive { background: #64748b; }
.btn { padding: 10px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
.btn-danger { background: linear-gradient(135deg, #ef4444, #f97316); color: white; }
.btn-danger:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
.btn-group { display: flex; gap: 12px; margin-top: 16px; }
.slice-list { list-style: none; }
.slice-item { padding: 12px; background: #1e293b; border-radius: 10px; margin-bottom: 8px; }
.slice-title { font-weight: 600; margin-bottom: 4px; }
.slice-meta { font-size: 12px; color: #94a3b8; }
.prompt-box { width: 100%; padding: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; color: #e0e6ed; font-size: 14px; margin-bottom: 12px; resize: vertical; min-height: 60px; }
.prompt-box:focus { outline: none; border-color: #60a5fa; }
.result-box { background: #1e293b; border-radius: 10px; padding: 16px; margin-top: 16px; white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; transform: translateY(100px); opacity: 0; transition: all 0.3s; }
.toast.show { transform: translateY(0); opacity: 1; }
.toast.success { background: #22c55e; color: white; }
.toast.error { background: #ef4444; color: white; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>⚡ Hermes Rig Dashboard</h1>
    <span class="badge">Orchestration Mesh</span>
  </div>

  <div class="grid">
    <div class="card">
      <h3>🎯 Seat Status</h3>
      <div id="seat-list"></div>
      <div class="btn-group">
        <button class="btn btn-primary" onclick="rigUp()">▶ Boot All Seats</button>
        <button class="btn btn-danger" onclick="rigDown()">⏹ Terminate All</button>
      </div>
    </div>

    <div class="card">
      <h3>🧠 Execute Task</h3>
      <textarea class="prompt-box" id="task-input" placeholder="Enter a task for the Rig..."></textarea>
      <button class="btn btn-primary" onclick="rigRun()">▶ Run Task</button>
      <div id="task-result" class="result-box" style="display:none;"></div>
    </div>

    <div class="card">
      <h3>📋 Active Slices</h3>
      <ul id="slice-list" class="slice-list"></ul>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
async function api(path, opts = {}) {
  const res = await fetch(path, { headers: {'Content-Type': 'application/json'}, ...opts });
  return res.json();
}
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}
async function loadStatus() {
  try {
    const data = await api('/api/rig/status');
    document.getElementById('seat-list').innerHTML = data.seats.map(s => `
      <div class="seat">
        <span class="seat-name">${s.seat}</span>
        <span class="seat-status"><span class="dot ${s.active ? 'active' : 'inactive'}"></span>${s.active ? 'Active' : 'Idle'}</span>
      </div>`).join('');
    document.getElementById('slice-list').innerHTML = data.slices.length ? data.slices.map(s => `
      <li class="slice-item"><div class="slice-title">${s.title || s.id}</div><div class="slice-meta">${s.owner || 'unassigned'} · priority ${s.priority || '-'}</div></li>`).join('') : '<li style="color:#64748b">No active slices</li>';
  } catch(e) { console.error(e); }
}
async function rigUp() { api('/api/rig/up', {method:'POST'}).then(d => { toast(d.message||'Seats booted'); loadStatus(); }).catch(e => toast('Error: '+e.message, 'error')); }
async function rigDown() { api('/api/rig/down', {method:'POST'}).then(d => { toast(d.message||'Seats terminated'); loadStatus(); }).catch(e => toast('Error: '+e.message, 'error')); }
async function rigRun() {
  const task = document.getElementById('task-input').value.trim();
  if (!task) return toast('Enter a task first', 'error');
  const resEl = document.getElementById('task-result');
  resEl.style.display = 'block'; resEl.textContent = 'Running...';
  try {
    const data = await api('/api/rig/run', {method:'POST', body: JSON.stringify({request: task})});
    resEl.textContent = data.result || JSON.stringify(data, null, 2);
    toast('Task completed'); loadStatus();
  } catch(e) { resEl.textContent = 'Error: '+e.message; toast('Error', 'error'); }
}
loadStatus(); setInterval(loadStatus, 5000);
</script>
</body>
</html>"""