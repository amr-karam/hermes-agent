"""
Traccia integration CLI commands for Hermes Agent Desktop.

Commands:
- traccia init: Initialize Traccia tracing for Hermes Agent Desktop
- traccia trace: Trace a specific Hermes command or skill execution
- traccia start/stop: Start/stop continuous tracing
- traccia config: View or modify Traccia configuration
- traccia status: Check Traccia tracing status
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

from hermes_traccia_integration import (
    load_config,
    save_config,
    get_config,
    set_config,
    init_traccia,
    is_traccia_available,
    get_tracer,
)


def cmd_init(args: argparse.Namespace) -> int:
    """Initialize Traccia tracing."""
    if not is_traccia_available():
        print("ERROR: Traccia SDK not installed. Install with: pip install traccia")
        return 1
    
    exporter = "console"
    endpoint = None
    api_key = None
    
    if args.console:
        exporter = "console"
        print("Initializing Traccia with console exporter...")
    elif args.platform:
        exporter = "traccia"
        api_key = args.api_key or args.api_key_env and __import__('os').environ.get(args.api_key_env)
        if not api_key:
            api_key = input("Enter Traccia API key: ").strip()
        print("Initializing Traccia with platform exporter...")
    elif args.endpoint:
        exporter = "otlp"
        endpoint = args.endpoint
        print(f"Initializing Traccia with OTLP endpoint: {endpoint}")
    else:
        exporter = "console"
        print("Initializing Traccia with console exporter (default)...")
    
    if init_traccia(exporter=exporter, endpoint=endpoint, api_key=api_key):
        print(f"✓ Traccia initialized successfully")
        print(f"  Exporter: {exporter}")
        if endpoint:
            print(f"  Endpoint: {endpoint}")
        return 0
    else:
        print("✗ Failed to initialize Traccia")
        return 1


def cmd_trace(args: argparse.Namespace) -> int:
    """Trace a specific Hermes command or skill execution."""
    if not is_traccia_available():
        print("ERROR: Traccia SDK not installed. Run 'hermes traccia init' first.")
        return 1
    
    tracer = get_tracer()
    if not tracer:
        print("ERROR: Traccia not initialized. Run 'hermes traccia init' first.")
        return 1
    
    config = load_config()
    sample_rate = config.get("sample_rate", 1.0)
    
    with tracer.start_span(f"hermes.{args.skill}.{args.command}") as span:
        span.set_attribute("hermes.skill", args.skill)
        span.set_attribute("hermes.command", args.command)
        
        if args.args:
            span.set_attribute("hermes.args", " ".join(args.args))
        
        # Add custom attributes
        if args.attribute:
            for attr in args.attribute:
                if "=" in attr:
                    key, value = attr.split("=", 1)
                    span.set_attribute(f"hermes.{key.strip()}", value.strip())
        
        print(f"Tracing: {args.skill} {args.command} {' '.join(args.args) if args.args else ''}")
        print(f"Span: hermes.{args.skill}.{args.command}")
        
        # Simulate trace completion
        span.set_status(__import__('opentelemetry.sdk.trace').status.Status.OK)
    
    print("✓ Trace recorded")
    return 0


def cmd_start(args: argparse.Namespace) -> int:
    """Start continuous tracing."""
    if not is_traccia_available():
        print("ERROR: Traccia SDK not installed. Run 'hermes traccia init' first.")
        return 1
    
    config = load_config()
    config["enabled"] = True
    config["trace_scope"] = args.scope if args.scope else "all"
    save_config(config)
    
    print(f"✓ Continuous tracing started (scope: {config['trace_scope']})")
    return 0


def cmd_stop(args: argparse.Namespace) -> int:
    """Stop continuous tracing."""
    config = load_config()
    config["enabled"] = False
    save_config(config)
    
    print("✓ Continuous tracing stopped")
    return 0


def cmd_config(args: argparse.Namespace) -> int:
    """View or modify Traccia configuration."""
    if args.action == "get":
        if args.key:
            value = get_config(args.key)
            if value is None:
                print(f"Key '{args.key}' not found")
                return 1
            print(f"{args.key}: {value}")
        else:
            config = load_config()
            print(json.dumps(config, indent=2))
        return 0
    
    elif args.action == "set":
        if not args.key:
            print("ERROR: --key required for set action")
            return 1
        value = args.value
        # Try to parse as JSON for complex values
        if value.startswith("{") or value.startswith("["):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                pass
        elif value.lower() == "true":
            value = True
        elif value.lower() == "false":
            value = False
        else:
            try:
                value = int(value)
            except ValueError:
                try:
                    value = float(value)
                except ValueError:
                    pass
        
        if set_config(args.key, value):
            print(f"✓ Set {args.key} = {value}")
            return 0
        else:
            print(f"✗ Failed to set {args.key}")
            return 1
    
    else:
        print("ERROR: Unknown action. Use 'get' or 'set'")
        return 1


def cmd_status(args: argparse.Namespace) -> int:
    """Check Traccia tracing status."""
    available = is_traccia_available()
    config = load_config()
    
    print("Traccia Integration Status")
    print("-" * 40)
    print(f"SDK Available: {'Yes' if available else 'No (pip install traccia)'}")
    print(f"Enabled: {'Yes' if config.get('enabled') else 'No'}")
    print(f"Exporter: {config.get('exporter', 'console')}")
    print(f"Sample Rate: {config.get('sample_rate', 1.0)}")
    if config.get("endpoint"):
        print(f"Endpoint: {config.get('endpoint')}")
    print(f"Capture Inputs: {config.get('capture_inputs', True)}")
    print(f"Capture Outputs: {config.get('capture_outputs', True)}")
    print(f"Redact PII: {config.get('redact_pii', True)}")
    return 0


def cmd_export(args: argparse.Namespace) -> int:
    """Export traces for analysis."""
    print("Trace export functionality")
    print("Note: Export location depends on your exporter configuration.")
    print(f"Console traces: see terminal output")
    print(f"OTLP traces: send to {load_config().get('endpoint', 'localhost')}")
    
    if args.format == "json":
        print("JSON export: Configure OTLP endpoint to export to file")
    elif args.format == "trace":
        print("Trace file: Export from your configured backend (Jaeger, Tempo, etc.)")
    
    return 0


def create_parser() -> argparse.ArgumentParser:
    """Create argument parser for traccia commands."""
    parser = argparse.ArgumentParser(
        prog="hermes traccia",
        description="Traccia observability integration for Hermes Agent Desktop"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # init command
    init_parser = subparsers.add_parser("init", help="Initialize Traccia tracing")
    init_parser.add_argument("--console", action="store_true", help="Use console exporter")
    init_parser.add_argument("--platform", action="store_true", help="Use Traccia platform")
    init_parser.add_argument("--api-key", help="Traccia API key")
    init_parser.add_argument("--api-key-env", help="Environment variable containing API key")
    init_parser.add_argument("--endpoint", help="OTLP endpoint URL")
    init_parser.set_defaults(func=cmd_init)
    
    # trace command
    trace_parser = subparsers.add_parser("trace", help="Trace a specific operation")
    trace_parser.add_argument("--skill", required=True, help="Skill name to trace")
    trace_parser.add_argument("--command", required=True, help="Command to trace")
    trace_parser.add_argument("args", nargs="*", help="Command arguments")
    trace_parser.add_argument("--attribute", action="append", help="Custom attributes (key=value)")
    trace_parser.set_defaults(func=cmd_trace)
    
    # start command
    start_parser = subparsers.add_parser("start", help="Start continuous tracing")
    start_parser.add_argument("--scope", choices=["all", "models", "tools", "skills", "conversations"],
                             help="Tracing scope")
    start_parser.set_defaults(func=cmd_start)
    
    # stop command
    stop_parser = subparsers.add_parser("stop", help="Stop continuous tracing")
    stop_parser.set_defaults(func=cmd_stop)
    
    # config command
    config_parser = subparsers.add_parser("config", help="View/modify configuration")
    config_parser.add_argument("action", choices=["get", "set"], help="Action")
    config_parser.add_argument("--key", help="Configuration key")
    config_parser.add_argument("--value", help="Configuration value")
    config_parser.set_defaults(func=cmd_config)
    
    # status command
    status_parser = subparsers.add_parser("status", help="Check tracing status")
    status_parser.set_defaults(func=cmd_status)
    
    # export command
    export_parser = subparsers.add_parser("export", help="Export traces")
    export_parser.add_argument("--format", choices=["json", "trace"], default="json", help="Export format")
    export_parser.set_defaults(func=cmd_export)
    
    return parser


def main(args: Optional[list] = None) -> int:
    """Main entry point for traccia CLI."""
    parser = create_parser()
    parsed = parser.parse_args(args)
    
    if parsed.command is None:
        parser.print_help()
        return 0
    
    return parsed.func(parsed)


if __name__ == "__main__":
    sys.exit(main())