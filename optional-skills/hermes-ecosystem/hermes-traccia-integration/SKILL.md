---
name: hermes-traccia-integration
production: true
description: Traccia observability integration for Hermes Agent Desktop.
tags: [hermes, traccia, integration, tracing, observability, AI]
category: devops
---

# Hermes Traccia Integration

This skill provides seamless integration with Traccia observability platform for Hermes Agent Desktop. It enables tracing of agent workflows, model calls, tool usage, and performance metrics with automatic OpenTelemetry-compatible export.

## Quick Start

### Install Traccia SDK

```bash
# Install Traccia Python SDK
pip install traccia

# Enable optional OTLP dependencies for full tracing
pip install 'hermes-agent[otlp]'
```

### Initialize Traccia

```bash
# Basic console tracing for development
hermes traccia init --console

# Production setup with Traccia platform
hermes traccia init --platform --api-key YOUR_TRACCIA_API_KEY

# Custom endpoint setup
hermes traccia init --endpoint http://localhost:4318/v1/traces
```

### Trace Your Agent

```bash
# Trace a specific skill execution
hermes traccia trace --skill hermes-analytics-dashboard --command "dashboard create"

# Trace all agent operations
hermes traccia start --scope all

# Stop tracing
hermes traccia stop
```

## Core Capabilities

### 1. Automatic Instrumentation

The skill automatically instruments:
- Agent conversations and turns
- Model API calls (LLM providers)
- Tool executions
- Skill invocations
- Custom function calls

### 2. Trace Export Options

| Export Target | Description |
|---------------|-------------|
| **Console** | Human-readable trace output to terminal |
| **Jaeger** | Local Jaeger instance via OTLP/gRPC |
| **Grafana Tempo** | Tempo backend via OTLP/HTTP |
| **Zipkin** | Zipkin collector via HTTP |
| **Traccia Platform** | Direct integration with traccia.ai |

### 3. Trace Attributes

Each trace includes:
- Agent identity and session information
- Model provider, model name, and parameters
- Token usage and cost estimates
- Execution timing and performance metrics
- Error information and stack traces
- Custom attributes from traced functions

### 4. Configuration

Configure tracing in `~/.hermes/config.yaml`:

```yaml
traccia:
  enabled: true
  exporter: console  # console, jaeger, tempo, zipkin, traccia
  api_key: ${TRACCIA_API_KEY}  # Optional for Traccia platform
  endpoint: http://localhost:4318/v1/traces  # For self-hosted backends
  sample_rate: 1.0  # Trace sampling (0.0-1.0)
  capture_inputs: true  # Capture function arguments
  capture_outputs: true  # Capture function return values
  redact_pii: true  # Automatically redact PII
  max_string_length: 1000  # Truncate long strings
```

## Advanced Usage

### Custom Instrumentation

```python
from traccia import init, observe
from hermes import run_agent

# Initialize with your preferred exporter
init(exporter="jaeger", endpoint="http://localhost:14268/api/traces")

@observe()
def my_custom_agent(task: str) -> str:
    """Your custom agent logic"""
    agent = run_agent()
    return agent.chat(task)

# The function call will be automatically traced
result = my_custom_agent("Research quantum computing")
```

### Context Propagation

Traccia automatically propagates trace context across:
- Agent delegations and subagents
- Tool executions
- Skill invocations
- Async operations
- RPC calls (when applicable)

### Performance Overhead

The tracing implementation is designed for minimal overhead:
- Sampling-based collection (configurable)
- Asynchronous export when possible
- Efficient serialization
- Lazy initialization of exporters

## Commands

### traccia init

Initialize Traccia tracing for Hermes Agent Desktop.

```bash
hermes traccia init [--console] [--platform] [--endpoint URL] [--api-key KEY]
```

Options:
- `--console`: Enable console exporter (default for development)
- `--platform`: Use Traccia platform (requires API key)
- `--endpoint URL`: Custom OTLP endpoint
- `--api-key KEY`: Traccia platform API key

### traccia trace

Trace a specific Hermes command or skill execution.

```bash
hermes traccia trace --skill SKILL_NAME --command COMMAND [--args ARGS]
```

### traccia start/stop

Start/stop continuous tracing of all agent operations.

```bash
hermes traccia start [--scope SCOPE]
hermes traccia stop
```

Scope options: `all`, `models`, `tools`, `skills`, `conversations`

### traccia config

View or modify Traccia configuration.

```bash
hermes traccia config get [KEY]
hermes traccia config set KEY VALUE
```

## Verification

Verify tracing is working:

```bash
# Check status
hermes traccia status

# View recent traces
hermes traccia list --limit 10

# Export traces for analysis
hermes traccia export --format json --output traces.json
```

## Security & Privacy

Traccia integration respects Hermes security model:
- PII is automatically redacted by default
- No data leaves your machine without explicit configuration
- API keys and secrets are protected via Hermes secret scope
- Tracing respects profile isolation and multiplexing
- Configuration is profile-specific