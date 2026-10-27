import argparse
import re
from orchestration.rig_controller import RigController
from orchestration.paths import resolve_root, resolve_project_name
from orchestration.llm_client import LLMUnavailableError, LLMOutputError

# Log lines look like "[ts] [LEVEL] [agent] KIND rest..." once the bridge has
# stamped the acting agent, so the agent prefix must be stripped before the
# record can be classified.
_AGENT_PREFIX = re.compile(r"^\[[^\]]*\]\s*")


def _kind(record):
    return _AGENT_PREFIX.sub("", record["event"]).split(" ", 1)[0].rstrip(":")


def _body(record):
    text = _AGENT_PREFIX.sub("", record["event"])
    return text.split(" ", 1)[1] if " " in text else text

def build_rig_parser(subparsers):
    """Builds the argparse parser for the 'rig' subcommand."""
    # Project scoping is accepted either side of the subcommand, because
    # `rig log <id> --project-name x` is the order anyone actually types.
    # SUPPRESS keeps the subparser from overwriting a value given before it.
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--project-root", default=argparse.SUPPRESS,
                        help="Project root (default: current working directory).")
    common.add_argument("--project-name", default=argparse.SUPPRESS,
                        help="Workspace project name (default: $HERMES_RIG_PROJECT or hermes-core).")

    rig_parser = subparsers.add_parser("rig", description="Manage the Hermes Rig orchestration mesh.",
                                       parents=[common])
    rig_subparsers = rig_parser.add_subparsers(dest="rig_action", required=True)

    # 'up' subcommand
    up_parser = rig_subparsers.add_parser("up", parents=[common],
                                          help="Boot the Rig seats into tmux sessions.")
    up_parser.add_argument("--seats", nargs="+", default=["nexus", "librarian", "builder", "critic", "operator"],
                           help="Specific seats to launch (default: all core seats)")
    up_parser.add_argument("--mission", default=None, help="Mission id the seats should work on.")
    up_parser.add_argument("--test-command", default=None,
                           help="Override the test command (default: the repo's canonical runner).")

    # 'ps' subcommand
    rig_subparsers.add_parser("ps", parents=[common],
                              help="Display current Rig status and active slices.")

    # 'status' subcommand
    rig_subparsers.add_parser("status", parents=[common],
                              help="List all missions in the durable workspace.")

    # 'down' subcommand
    rig_subparsers.add_parser("down", parents=[common],
                              help="Terminate all running Rig seats.")

    # 'approve' subcommand
    approve_parser = rig_subparsers.add_parser("approve", parents=[common],
                                               help="Approve a paused risky slice.")
    approve_parser.add_argument("mission_id", help="The ID of the mission to resume")
    approve_parser.add_argument("slice_id", nargs="?", help="Specific slice to approve (default: all paused)")

    # 'reject' subcommand
    reject_parser = rig_subparsers.add_parser("reject", parents=[common],
                                              help="Reject a risky slice and reset it to pending.")
    reject_parser.add_argument("mission_id", help="The ID of the mission")
    reject_parser.add_argument("slice_id", help="The ID of the slice to reject")

    # 'log' subcommand
    log_parser = rig_subparsers.add_parser("log", parents=[common],
                                           help="Show recorded commands and slice state for a mission.")
    log_parser.add_argument("mission_id", help="The mission to inspect")
    log_parser.add_argument("--full", action="store_true", help="Include full event text.")

    # 'run' subcommand
    run_parser = rig_subparsers.add_parser("run", parents=[common],
                                           help="Execute a task via the Rig's CrewAI orchestration.")
    run_parser.add_argument("request", help="The technical goal to execute")
    run_parser.add_argument("--resume", metavar="MISSION_ID", default=None,
                            help="Resume a paused or interrupted mission instead of slicing a new one.")
    run_parser.add_argument("--new", dest="force_new", action="store_true",
                            help="Run the goal again even if it already completed.")

    rig_parser.set_defaults(func=handle_rig_command)
    return rig_parser

def handle_rig_command(args):
    """
    Dispatches the 'rig' subcommand to the RigController.
    """
    root = resolve_root(getattr(args, "project_root", None))
    proj = resolve_project_name(getattr(args, "project_name", None))

    # status and ps only read; they must not create a workspace as a side effect.
    read_only = args.rig_action in ("status", "ps")
    controller = RigController(root, proj, read_only=read_only)

    if args.rig_action == "up":
        # Seats poll a specific mission. Without one they would sit idle, because
        # the old hardcoded "active-mission" no longer exists under T1 mission ids.
        if not args.mission:
            print("Error: 'up' requires --mission <id> so the seats know what to work on.")
            print("  Create one first:  hermes rig run \"<goal>\"")
            raise SystemExit(2)
        controller.up(args.seats, mission_id=args.mission, test_command=args.test_command)
    elif args.rig_action == "ps":
        controller.ps()
    elif args.rig_action == "status":
        missions = controller.wm.get_all_missions()
        if not missions:
            print("No missions found in the durable workspace.")
            return
        
        print(f"\n{'ID':<15} {'Status':<15} {'Progress':<12} {'Goal'}")
        print("-" * 60)
        for m in missions:
            print(f"{m['id']:<15} {m['status']:<15} {m['progress']:<12} {m['goal']}")
    elif args.rig_action == "approve":
        try:
            if args.slice_id:
                controller.wm.set_approved(args.mission_id, args.slice_id, True)
                controller.wm.update_slice_state(args.mission_id, args.slice_id, "in_progress")
                print(f"Approved {args.mission_id}/{args.slice_id}.")
            else:
                paused = controller.wm.get_paused_slices(args.mission_id)
                if not paused:
                    print(f"No paused slices in {args.mission_id}.")
                for s in paused:
                    controller.wm.set_approved(args.mission_id, s["id"], True)
                    controller.wm.update_slice_state(args.mission_id, s["id"], "in_progress")
                print(f"Approved {len(paused)} slice(s) in {args.mission_id}. Run 'hermes rig run --resume {args.mission_id} \"<goal>\"' to continue.")
        except (ValueError, FileNotFoundError) as e:
            print(f"Error: {e}")
    elif args.rig_action == "reject":
        try:
            controller.wm.set_approved(args.mission_id, args.slice_id, False)
            controller.wm.update_slice_state(args.mission_id, args.slice_id, "pending")
            print(f"Rejected {args.mission_id}/{args.slice_id}. Edit its SPEC.md, then re-run.")
        except (ValueError, FileNotFoundError) as e:
            print(f"Error: {e}")
    elif args.rig_action == "down":
        controller.down()
    elif args.rig_action == "log":
        try:
            slices = controller.wm.get_slice_report(args.mission_id)
            records = controller.wm.read_log(args.mission_id)
        except (ValueError, FileNotFoundError) as e:
            print(f"Error: {e}")
            return

        if not slices and not records:
            print(f"No record found for mission {args.mission_id}.")
            return

        print(f"\n=== Mission {args.mission_id} ===")
        if slices:
            print(f"{'Slice':<14} {'Status':<20} {'Owner':<12} {'Risk':<6} Title")
            print("-" * 78)
            for s in slices:
                risk = "GATED" if (s["is_risky"] and not s["approved"]) else ("risky" if s["is_risky"] else "-")
                print(f"{s['id']:<14} {str(s['status']):<20} {str(s['owner'] or '-'):<12} {risk:<6} {s['title']}")

        results = [r for r in records if _kind(r) == "RESULT"]
        commands = [r for r in records if _kind(r) == "CMD"]
        rejected = [r for r in records if _kind(r) == "REJECTED"]

        print(f"\n--- Commands executed ({len(commands)}) ---")
        for r in commands:
            print(f"  {r['ts']}  {_body(r)}")
        if not commands:
            print("  (none recorded)")

        if results:
            print(f"\n--- Outcomes ({len(results)}) ---")
            for r in results:
                print(f"  {r['ts']}  {_body(r)}")
        if rejected:
            print(f"\n--- Refused ({len(rejected)}) ---")
            for r in rejected:
                print(f"  {r['ts']}  {_body(r)}")
        if not args.full:
            others = [r for r in records if _kind(r) not in ("CMD", "RESULT", "REJECTED")]
            if others:
                print(f"\n--- Other events ({len(others)}) -- use --full to see ---")
        print()
    elif args.rig_action == "run":
        if not args.request:
            print("Error: 'run' requires a request string.")
            raise SystemExit(2)
        try:
            result = controller.run(args.request, resume=args.resume, force_new=args.force_new)
            if isinstance(result, dict):
                print(f"\n--- Rig Result ({result.get('status')}) ---")
                print(result.get("summary", ""))
                tier = result.get("tier") or {}
                if tier:
                    print(f"  tier={tier.get('tier')} seat={tier.get('target_seat')} "
                          f"confidence={tier.get('confidence')}")
                for entry in result.get("tasks_output", []) or []:
                    print(f"  [{entry.get('agent')}] {entry.get('slice_id')} {entry.get('title')}")
                if not result.get("tasks_output"):
                    print("  (no slices executed)")
                # An escalation exits non-zero for the same reason a model
                # outage does: nothing was planned and nothing ran, and a
                # scheduler or CI step must not read that as success.
                if result.get("status") == "escalated":
                    raise SystemExit(4)
            else:
                print(f"\n--- Rig Execution Result ---\n{result}")
        except (ValueError, FileNotFoundError) as e:
            print(f"Error: {e}")
            raise SystemExit(1)
        except (LLMUnavailableError, LLMOutputError) as e:
            # A model outage is an error, not a pause. Exit non-zero so a scheduler
            # or CI step notices, and so nobody mistakes it for a completed run.
            print(f"\nModel unavailable - nothing was planned and nothing was executed.\n  {e}")
            raise SystemExit(3)
