"""Orchestration engine for the Hermes dashboard.

Provides the OrchestrationEngine class imported by web_server_dashboard.py
via `from orchestration import OrchestrationEngine`.

This is a minimal implementation exposing the surface the dashboard expects.
Extend with real orchestration logic as needed.
"""


class OrchestrationEngine:
    """Engine for orchestrating dashboard-level operations."""

    def __init__(self):
        self._tasks = {}

    def list_tasks(self):
        """Return a list of orchestration tasks."""
        return list(self._tasks.values())

    def get_task(self, task_id):
        """Return a single orchestration task by id."""
        return self._tasks.get(task_id)

    def create_task(self, task_type, payload=None):
        """Create a new orchestration task."""
        task_id = str(len(self._tasks) + 1)
        self._tasks[task_id] = {
            "id": task_id,
            "type": task_type,
            "payload": payload or {},
            "status": "pending",
        }
        return self._tasks[task_id]

    def cancel_task(self, task_id):
        """Cancel an orchestration task."""
        if task_id in self._tasks:
            self._tasks[task_id]["status"] = "cancelled"
            return True
        return False

    def health(self):
        """Return orchestration engine health status."""
        return {"status": "ok", "task_count": len(self._tasks)}