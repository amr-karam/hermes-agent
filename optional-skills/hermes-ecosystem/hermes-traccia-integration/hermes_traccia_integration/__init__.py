"""
Hermes Traccia Integration Skill

Provides Traccia observability integration for Hermes Agent Desktop.
Enables tracing of agent workflows, model calls, tool usage, and performance metrics
with automatic OpenTelemetry-compatible export.
"""

from __future__ import annotations

import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Skill metadata
__version__ = "1.0.0"
__skill_name__ = "hermes-traccia-integration"

# Configuration file location
CONFIG_DIR = Path(os.environ.get("HERMES_HOME", Path.home() / ".hermes")) / "traccia"
CONFIG_FILE = CONFIG_DIR / "config.json"

# Default configuration
DEFAULT_CONFIG = {
    "enabled": False,
    "exporter": "console",
    "endpoint": "http://localhost:4318/v1/traces",
    "api_key": None,
    "sample_rate": 1.0,
    "capture_inputs": True,
    "capture_outputs": True,
    "redact_pii": True,
    "max_string_length": 1000,
}


def load_config() -> Dict[str, Any]:
    """Load Traccia configuration from file."""
    if not CONFIG_FILE.exists():
        return DEFAULT_CONFIG.copy()
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
        # Merge with defaults
        result = DEFAULT_CONFIG.copy()
        result.update(config)
        return result
    except Exception as e:
        logger.warning(f"Failed to load Traccia config: {e}")
        return DEFAULT_CONFIG.copy()


def save_config(config: Dict[str, Any]) -> bool:
    """Save Traccia configuration to file."""
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Failed to save Traccia config: {e}")
        return False


def get_config(key: Optional[str] = None) -> Any:
    """Get configuration value."""
    config = load_config()
    if key is None:
        return config
    return config.get(key)


def set_config(key: str, value: Any) -> bool:
    """Set configuration value."""
    config = load_config()
    config[key] = value
    return save_config(config)


def init_traccia(exporter: str = "console", endpoint: Optional[str] = None, 
                api_key: Optional[str] = None) -> bool:
    """Initialize Traccia tracing."""
    try:
        # Import here to avoid requiring traccia as hard dependency
        from traccia import init
    except ImportError:
        logger.error("Traccia SDK not installed. Run: pip install traccia")
        return False
    
    config = load_config()
    config["exporter"] = exporter
    if endpoint:
        config["endpoint"] = endpoint
    if api_key:
        config["api_key"] = api_key
    config["enabled"] = True
    save_config(config)
    
    # Initialize Traccia based on exporter
    if exporter == "console":
        init(enable_console_exporter=True)
    elif exporter in ("jaeger", "tempo", "zipkin", "otlp"):
        if not endpoint:
            logger.error(f"Endpoint required for {exporter} exporter")
            return False
        init(endpoint=endpoint)
    elif exporter == "traccia":
        if not api_key:
            logger.error("API key required for Traccia platform exporter")
            return False
        os.environ["TRACCIA_API_KEY"] = api_key
        init()
    else:
        logger.error(f"Unknown exporter: {exporter}")
        return False
    
    logger.info(f"Traccia initialized with {exporter} exporter")
    return True


def is_traccia_available() -> bool:
    """Check if Traccia SDK is available."""
    try:
        import traccia
        return True
    except ImportError:
        return False


def get_tracer():
    """Get Traccia tracer instance."""
    try:
        from traccia import get_tracer
        return get_tracer()
    except Exception:
        return None


__all__ = [
    "load_config",
    "save_config", 
    "get_config",
    "set_config",
    "init_traccia",
    "is_traccia_available",
    "get_tracer",
    "DEFAULT_CONFIG",
]