"""Smoke coverage for the orchestration/ package and its two stub consumers.

Contracts covered: workspace CRUD (missions/slices/log, read-only refusal,
missing-id errors), deterministic slicing, controller run/escalate/approve/resume,
the model-required error path, graceful tmux-missing degradation, and that the
CLI and dashboard rig stubs import and register without modification.
"""

from __future__ import annotations

import argparse
import asyncio
import re
from pathlib import Path

import pytest

from orchestration.llm_client import (
    LLMClient,
    LLMOutputError,
    LLMUnavailableError,
)
from orchestration.paths import DEFAULT_PROJECT, resolve_project_name, resolve_root
from orchestration import rig_controller
from orchestration.rig_controller import RigController
from orchestration.slicer import SlicingAgent
from orchestration.workspace import WorkspaceManager

_MISSION_ID_RE = re.compile(r"^rig-\d{8}-[0-9a-f]{6}$")


@pytest.fixture(autouse=True)
def _clean_rig_env(monkeypatch):
    """Drop any developer-set Rig env so the default path stays deterministic."""
    for name in (
        "HERMES_RIG_MODEL",
        "HERMES_RIG_REQUIRE_MODEL",
        "HERMES_RIG_ROOT",
        "HERMES_RIG_PROJECT",
    ):
        monkeypatch.delenv(name, raising=False)


@pytest.fixture()
def wm(tmp_path):
    return WorkspaceManager(tmp_path, "test-proj")


@pytest.fixture()
def controller(tmp_path):
    return RigController(tmp_path, "test-proj")


# ── paths ──────────────────────────────────────────────────────────────────────


def test_resolve_root_precedence(tmp_path, monkeypatch):
    monkeypatch.setenv("HERMES_RIG_ROOT", str(tmp_path / "from-env"))
    assert resolve_root(tmp_path / "from-arg") == tmp_path / "from-arg"
    assert resolve_root() == tmp_path / "from-env"
    monkeypatch.delenv("HERMES_RIG_ROOT")
    monkeypatch.chdir(tmp_path)
    assert resolve_root() == Path.cwd()


def test_resolve_project_name_precedence(tmp_path, monkeypatch):
    monkeypatch.setenv("HERMES_RIG_PROJECT", "from-env")
    assert resolve_project_name("from-arg") == "from-arg"
    assert resolve_project_name() == "from-env"
    monkeypatch.delenv("HERMES_RIG_PROJECT")
    assert resolve_project_name() == DEFAULT_PROJECT


# ── workspace CRUD ─────────────────────────────────────────────────────────────


def test_workspace_crud(wm, tmp_path):
    goal = "Add a search box to the header."
    slices = SlicingAgent().slice(goal)
    mission_id = wm.create_mission(goal, slices=slices)

    assert _MISSION_ID_RE.match(mission_id), mission_id
    assert (tmp_path / "hermes-rig-workspaces" / "test-proj"
            / "missions" / mission_id / "SPEC.md").is_file()

    mission = wm.get_mission(mission_id)
    assert mission["goal"] == goal
    assert mission["status"] == "in_progress"
    assert mission["progress"] == "0/1"

    missions = wm.get_all_missions()
    assert [m["id"] for m in missions] == [mission_id]
    assert set(missions[0]) == {"id", "status", "progress", "goal"}

    report = wm.get_slice_report(mission_id)
    assert set(report[0]) == {"id", "status", "owner", "is_risky", "approved", "title"}
    slice_id = report[0]["id"]

    wm.set_approved(mission_id, slice_id, True)
    wm.update_slice_state(mission_id, slice_id, "in_progress")
    report = wm.get_slice_report(mission_id)
    assert report[0]["approved"] is True
    assert report[0]["status"] == "in_progress"

    wm.update_slice_state(mission_id, slice_id, "paused")
    paused = wm.get_paused_slices(mission_id)
    assert [s["id"] for s in paused] == [slice_id]

    wm.update_slice_state(mission_id, slice_id, "completed")
    assert wm.get_active_slices(mission_id) == []
    assert [s["id"] for s in wm.get_slice_report(mission_id)] == [slice_id]

    wm.append_log(mission_id, "CMD nexus did a thing")
    records = wm.read_log(mission_id)
    assert set(records[0]) == {"ts", "event"}
    assert any(r["event"].startswith("CREATED") for r in records)
    assert any(r["event"].startswith("CMD") for r in records)


def test_workspace_missing_ids_raise(wm):
    with pytest.raises(FileNotFoundError):
        wm.get_mission("rig-20261104-abcdef")
    with pytest.raises(FileNotFoundError):
        wm.set_approved("rig-20261104-abcdef", "s-01", True)
    with pytest.raises(ValueError):
        wm.get_mission("../escape")

    mission_id = wm.create_mission("goal", slices=SlicingAgent().slice("goal"))
    with pytest.raises(FileNotFoundError):
        wm.set_approved(mission_id, "s-99", True)
    with pytest.raises(FileNotFoundError):
        wm.update_slice_state(mission_id, "s-99", "completed")
    with pytest.raises(ValueError):
        wm.update_slice_state(mission_id, "s-01", "teleported")
    with pytest.raises(FileNotFoundError):
        wm.read_log("rig-20261104-abcdef")


def test_read_only_manager_refuses_writes_and_creates_nothing(tmp_path):
    ro = WorkspaceManager(tmp_path / "fresh", "proj", read_only=True)
    assert not (tmp_path / "fresh").exists()
    assert ro.get_all_missions() == []
    with pytest.raises(ValueError):
        ro.create_mission("goal")
    with pytest.raises(ValueError):
        ro.append_log("rig-20261104-abcdef", "event")


# ── slicer ─────────────────────────────────────────────────────────────────────


def test_slicer_is_deterministic_and_flags_risk():
    agent = SlicingAgent()
    plan = agent.slice("Fix the login bug. Update the docs.")
    assert len(plan) == 2
    assert plan == agent.slice("Fix the login bug. Update the docs.")
    assert [s["id"] for s in plan] == ["s-01", "s-02"]
    assert all(s["status"] == "pending" and s["approved"] is False for s in plan)
    assert plan[0]["is_risky"] is False

    risky = agent.slice("Deploy to production now.")
    assert risky[0]["is_risky"] is True
    assert agent.slice("") == []


def test_slicer_model_path_validates_output():
    good = '[{"title": "ship it", "owner": "builder", "is_risky": false}]'
    client = LLMClient(model="m", transport=lambda _: good)
    slices = SlicingAgent(client=client).slice("g")
    assert slices[0]["owner"] == "builder"
    assert slices[0]["approved"] is False  # model output never self-approves

    with pytest.raises(LLMOutputError):
        SlicingAgent(client=LLMClient(model="m", transport=lambda _: "")).slice("g")
    with pytest.raises(LLMOutputError):
        SlicingAgent(client=LLMClient(model="m", transport=lambda _: "nope")).slice("g")


# ── llm client ─────────────────────────────────────────────────────────────────


def test_llm_client_error_contract(monkeypatch):
    with pytest.raises(LLMUnavailableError):
        LLMClient().complete("prompt")
    with pytest.raises(LLMUnavailableError):
        LLMClient(model="some-model").complete("prompt")
    with pytest.raises(LLMOutputError):
        LLMClient(model="m", transport=lambda _: "   ").complete("prompt")
    assert LLMClient(model="m", transport=lambda _: "ok").complete("p") == "ok"
    monkeypatch.setenv("HERMES_RIG_MODEL", "env-model")
    assert LLMClient().model == "env-model"


def test_run_raises_only_when_model_required(controller, monkeypatch):
    # No model configured: the default run is deterministic and must not raise.
    result = controller.run("Fix the login bug.")
    assert result["status"] == "completed"

    monkeypatch.setenv("HERMES_RIG_REQUIRE_MODEL", "1")
    with pytest.raises(LLMUnavailableError):
        controller.run("Fix the login bug.")


# ── controller: run / resume / escalate ───────────────────────────────────────


def test_controller_run_completes_and_persists(controller, tmp_path):
    result = controller.run("Write a README section.")
    assert result["status"] == "completed"
    assert result["tasks_output"], result
    assert set(result) == {"status", "summary", "tier", "tasks_output"}
    assert set(result["tier"]) == {"tier", "target_seat", "confidence"}

    missions = controller.wm.get_all_missions()
    assert len(missions) == 1
    mission = controller.wm.get_mission(missions[0]["id"])
    assert mission["status"] == "completed"
    assert mission["progress"] == "1/1"

    events = [r["event"] for r in controller.wm.read_log(missions[0]["id"])]
    assert any(e.startswith("CMD") for e in events)
    assert any(e.startswith("RESULT") for e in events)
    workspace = tmp_path / "hermes-rig-workspaces" / "test-proj"
    assert workspace.is_dir()


def test_controller_gates_risky_slices_then_resumes(controller):
    # Two sentences: only the deploy one is risk-gated.
    result = controller.run("Add a search box. Deploy to production.")
    assert result["status"] == "completed"
    assert len(result["tasks_output"]) == 1

    mission_id = controller.wm.get_all_missions()[0]["id"]
    paused = controller.wm.get_paused_slices(mission_id)
    assert len(paused) == 1
    assert controller.wm.get_mission(mission_id)["progress"] == "1/2"

    # Approve the gate (the CLI's approve flow), then resume.
    slice_id = paused[0]["id"]
    controller.wm.set_approved(mission_id, slice_id, True)
    controller.wm.update_slice_state(mission_id, slice_id, "in_progress")

    goal = "Add a search box. Deploy to production."
    resumed = controller.run(goal, resume=mission_id)
    assert resumed["status"] == "completed"
    # tasks_output is what THIS call executed: the newly unblocked gate.
    assert [t["slice_id"] for t in resumed["tasks_output"]] == ["s-02"]
    assert controller.wm.get_mission(mission_id)["progress"] == "2/2"

    # A completed mission resumes to a no-op result unless --new is given;
    # that report lists the mission's completed slices.
    again = controller.run("anything", resume=mission_id)
    assert again["status"] == "completed"
    assert "already completed" in again["summary"]
    assert len(again["tasks_output"]) == 2


def test_controller_escalates_when_everything_is_gated(controller):
    result = controller.run("Deploy to production immediately.")
    assert result["status"] == "escalated"
    assert result["tasks_output"] == []
    assert "approve" in result["summary"]

    mission_id = controller.wm.get_all_missions()[0]["id"]
    assert controller.wm.get_paused_slices(mission_id), "gate must pause the slice"
    events = [r["event"] for r in controller.wm.read_log(mission_id)]
    assert any(e.startswith("ESCALATED") for e in events)
    assert any(e.startswith("REJECTED") for e in events)

    with pytest.raises(FileNotFoundError):
        controller.run("goal", resume="rig-20261104-abcdef")


def test_run_async_returns_result(controller):
    result = asyncio.run(controller.run_async("Write a changelog entry."))
    assert result["status"] == "completed"
    assert result["tasks_output"]


# ── controller: tmux degradation ───────────────────────────────────────────────


def test_tmux_missing_degrades_gracefully(controller, monkeypatch, capsys):
    # Same patch pattern the repo uses elsewhere: stub `shutil.which` on the
    # shared module (restored automatically) so tmux is absent on every host.
    monkeypatch.setattr(rig_controller.shutil, "which", lambda name: None)

    assert controller._session_exists("hermes-nexus") is False
    controller.up(["nexus", "builder"])
    controller.ps()
    controller.down()

    out = capsys.readouterr().out
    assert "tmux not found" in out
    assert "inactive" in out


def test_up_rejects_unknown_mission(controller, tmp_path, capsys):
    controller.up(["nexus"], mission_id="rig-20261104-abcdef")
    assert "mission not found" in capsys.readouterr().out


def test_up_passes_mission_context_to_seat_command():
    command = RigController._seat_command("nexus", "rig-20261104-a1b2c3", "pytest -q")
    assert "HERMES_RIG_SEAT=nexus" in command
    assert "HERMES_RIG_MISSION=rig-20261104-a1b2c3" in command
    assert "HERMES_RIG_TEST_COMMAND='pytest -q'" in command


# ── stubs import and register without modification ─────────────────────────────


def test_cli_stub_builds_rig_parser():
    from hermes_cli.subcommands.rig import build_rig_parser

    parser = argparse.ArgumentParser(prog="hermes")
    subparsers = parser.add_subparsers(dest="command")
    rig_parser = build_rig_parser(subparsers)
    assert rig_parser is not None

    status = parser.parse_args(["rig", "status"])
    assert status.rig_action == "status"

    up = parser.parse_args(["rig", "up", "--mission", "rig-20261104-a1b2c3"])
    assert up.rig_action == "up"
    assert up.mission == "rig-20261104-a1b2c3"
    assert up.seats == ["nexus", "librarian", "builder", "critic", "operator"]

    run = parser.parse_args(["rig", "run", "ship the feature"])
    assert run.rig_action == "run"
    assert run.request == "ship the feature"
    assert run.resume is None and run.force_new is False


def test_web_router_stub_exposes_rig_routes():
    from hermes_cli.web_routers.rig import router

    paths = {route.path for route in router.routes}
    assert {
        "/api/rig/status",
        "/api/rig/up",
        "/api/rig/down",
        "/api/rig/run",
        "/api/rig/slices",
        "/rig",
    } <= paths
