# Hermes Gateway API Contract

## Overview

The Hermes Gateway is a JSON-RPC transport layer that enables clients (TUI, Desktop, Dashboard) to communicate with the Hermes agent backend. It serves as the single source of truth for all agent interactions across every surface.

- **Protocol**: Newline-delimited JSON-RPC 2.0 over WebSocket (identical to the stdio transport used by the TUI)
- **Single source of truth**: Python (`tui_gateway/`) defines all contracts; TypeScript types are auto-generated via `scripts/gen_gateway_contracts.py`
- **WebSocket endpoint**: `/api/ws` (FastAPI `WebSocket` in `hermes_cli/web_routers/chat_ws.py`)
- **REST fallback**: Dashboard SPA at `localhost:PORT` with FastAPI backend (`hermes_cli/web_server.py`), same JSON-RPC methods available via HTTP routes in `hermes_cli/web_routers/`

---

## WebSocket Connection

### URL

```
ws://localhost:<PORT>/api/ws
```

The port is determined by the running `hermes` process (default configured via `--port` flag, typically 8080 or similar). The URL is resolved by `apps/shared/src/websocket-url.ts` via `resolveGatewayWsUrl()`.

### Auth Modes

| Mode | Description |
|------|-------------|
| `loopback` | Localhost connection, no token required |
| `gated` | Dashboard with session token auth (via header or `?token=` query) |
| `insecure` | Non-loopback bound host (logged, not recommended) |

Auth is handled in `hermes_cli/web_routers/chat_ws.py::_ws_auth_ok()`. The WebSocket connection accepts an optional `token` query parameter or `Authorization: Bearer <token>` header.

### Connection States (TypeScript)

```typescript
type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error';
```

Defined in `apps/shared/src/json-rpc-gateway.ts`.

---

## Protocol Format

### JSON-RPC Frame

Every message is a single JSON object followed by a newline:

```json
{"jsonrpc": "2.0", "id": 1, "method": "prompt.submit", "params": {...}}
```

**Request frame** (client → server):
- `jsonrpc`: `"2.0"`
- `id`: unique request identifier (integer or string)
- `method`: RPC method name (dot-separated, e.g. `prompt.submit`)
- `params`: object with method parameters

**Response frame** (server → client):
- `jsonrpc`: `"2.0"`
- `id`: matches the request `id`
- `result`: the result data (on success)
- `error`: error object (on failure) with `code` and `message`

**Event frame** (server → client, unsolicited):
- `jsonrpc`: `"2.0"`
- `method`: event type (e.g. `message.delta`)
- `params`: event payload

**Server Request frame** (server → client, requiring response):
- `jsonrpc`: `"2.0"`
- `id`: request id (format `srq-<n>`)
- `method`: request type (e.g. `approval`, `clarify`, `sudo`, `secret`)
- `params`: request parameters

### Error Codes

| Code | Meaning |
|------|---------|
| `-32601` | Unknown method (client/server version mismatch) |
| `-32000` | Handler error |
| `4000` | Invalid parameters (key path) |
| `4064` | Profile unavailable |
| `5035` | Backend retiring |

---

## JSON-RPC Methods (Client → Server)

Methods are registered via `register_method()` in `tui_gateway/server.py`. Each method lives in a `methods_<topic>.py` sibling module. The full catalog is auto-generated into `apps/shared/src/gateway-contract.generated.ts` as `RpcMethods`.

Key method categories (from `tui_gateway/rpc_dispatch.py` and `server.py` imports):

| Category | Methods (examples) | Module |
|----------|-------------------|--------|
| Session | `session.list`, `session.resume`, `session.new`, `session.close` | `methods_session.py` |
| Prompt | `prompt.submit`, `prompt.continue` | `methods_session.py` |
| Message | `message.delta`, `message.complete` | `methods_session.py` |
| Tool | `tool.start`, `tool.generating`, `tool.complete` | internal |
| Config | `config.get`, `config.set`, `config.reset` | `methods_config.py` |
| Profiles | `profiles.list`, `profiles.switch` | `methods_profiles.py` |
| Slash | `slash.exec`, `command.dispatch` | `methods_slash.py` |
| Browser | `browser.navigate`, `browser.screenshot` | `methods_browser.py` |
| Connectors | `connection.request`, `connection.respond` | `methods_connectors.py` |
| Subagents | `subagent.list`, `subagent.steer`, `subagent.interrupt` | `methods_subagents.py` |
| Vault | `vault.read`, `vault.write`, `vault.list` | `methods_vault.py` |
| Images | `images.generate`, `images.upload` | `methods_images.py` |
| Onboarding | `onboarding.start`, `onboarding.complete` | `methods_onboarding.py` |
| Display | `display.watch`, `display.set` | `methods_display.py` |
| Bot Relay | `bot.relay.send` | `methods_bot_relay.py` |
| Voice | `voice.transcribe`, `voice.synthesize` | `methods_voice.py` |
| Projects | `projects.list`, `projects.open` | `methods_projects.py` |
| Billing | `billing.view`, `billing.usage` | `billing_view.py` |
| Free Tier | `free_tier.sign_in`, `free_tier.upgrade` | `methods_free_tier.py` |
| MCP | `mcp.servers.*` | `methods_tools.py` |

### Long-Handler Dispatch

Some methods are classified as "long handlers" (seconds to minutes) and are dispatched to a thread pool (`tui_gateway/rpc_dispatch.py`). The `dispatch()` function in `rpc_dispatch.py` routes:
- Non-long handlers: inline execution, returns response dict
- Long handlers: enqueued to `_pool`, returns `None`; the worker writes its own response via the bound transport

---

## Server Requests (Server → Client, requiring response)

The server can send requests to the client that require a response frame back. These are defined in `tui_gateway/server_requests.py`.

| Method | Description | Response |
|--------|-------------|----------|
| `approval` | Ask user to approve a tool call | `{choice: "accept"\|"deny"}` |
| `clarify` | Ask user a clarifying question | `{answer: string}` |
| `sudo` | Ask for sudo/elevation confirmation | `{choice: "grant"\|"deny"}` |
| `secret` | Ask for a secret value | `{value: string}` |
| `connection` | Ask to establish a connection | `{op_id, ...}` |
| `vault.*` | Vault-related queries | varies |

**Protocol**: Server requests use `srq-<n>` as the `id` format. The client must respond with a frame having the same `id` and either `result` or `error`.

**Desktop compatibility**: Desktop clients that never sent `client.capabilities {server_requests: true}` on `gateway.ready` are considered pre-request-capable; `send()` fails fast for them instead of stalling.

---

## Events (Server → Client)

Events are unsolicited notifications from server to client. Defined in `tui_gateway/contracts/events.py` and auto-generated to `BackendGatewayEventMap` in TypeScript.

Key event types:

| Event | Description | Payload |
|-------|-------------|---------|
| `gateway.ready` | Gateway is ready, carries skin/auth data | `GatewayReadyPayload` |
| `message.delta` | Streaming message chunk | `MessageDeltaPayload` |
| `message.complete` | Message finished | `MessageCompletePayload` |
| `tool.start` | Tool call started | `ToolStartPayload` |
| `tool.generating` | Tool generating output | `ToolGeneratingPayload` |
| `tool.complete` | Tool call finished | `ToolCompletePayload` |
| `session.info` | Session metadata update | `SessionInfoPayload` |
| `session.error` | Session error | `SessionErrorPayload` |
| `agent.started` | Agent build started | `AgentStartedPayload` |
| `agent.build_progress` | Agent build progress | `AgentBuildProgressPayload` |
| `plugins.compat_report` | Plugin compatibility report | `PluginCompatReportPayload` |
| `complete.slash` | Slash command completions | `CompleteSlashPayload` |
| `complete.path` | Path completions | `CompletePathPayload` |

### Client-Local Synthetic Events

Additional events generated by the client SDK (`apps/shared/src/gateway-events.ts`):

| Event | Description |
|-------|-------------|
| `gateway.protocol_error` | JSON-RPC protocol error detected |
| `gateway.reconnecting` | Reconnection attempt started |
| `gateway.start_timeout` | Connection start timed out |
| `gateway.stderr` | Gateway stderr output |
| `dashboard.new_session_requested` | Dashboard requests a new session |

---

## Connection Lifecycle

```
idle → connecting → open → closed
                ↘ error
```

1. **idle**: No active connection
2. **connecting**: WebSocket opening handshake in progress
3. **open**: Connection established, client sends `client.capabilities` frame
4. **closed**: Connection closed normally
5. **error**: Connection error

### Reconnection

- `JsonRpcGatewayClient` (`apps/shared/src/json-rpc-gateway.ts`) handles reconnection with exponential backoff
- `reconnect-backoff.ts` provides the backoff strategy
- On reconnect, the client replays pending requests using a `replay_epoch` counter
- Server-side event dedup uses `(replay_epoch, session_id, seq)` as the dedup key (`DUPLICATE_WINDOW_MS` in `gateway-event-dedupe.ts`)

### Heartbeat / Scale-to-Zero

- Dashboard clients use a heartbeat mechanism to detect server liveness
- `DEFAULT_HEARTBEAT_INTERVAL_MS` and `DEFAULT_HEARTBEAT_DEADLINE_MS` in `ws.py`
- Scale-to-zero: `_DASHBOARD_CLIENT_TOUCH_MIN_INTERVAL_S = 5.0s` — dashboard clients must touch at least every 5 seconds to be considered active

---

## REST API Fallback

The dashboard at `localhost:PORT` provides a REST API alongside the WebSocket:

- **Base URL**: `http://localhost:<PORT>/api/`
- **Auth**: Session token via `X-Session-Token` header or `?token=` query parameter
- **CORS**: Restricted to `localhost` / `127.0.0.1` origins only

Key REST routes (from `hermes_cli/web_routers/`):
- `/chat` — Embedded chat tab
- `/api/pty` — PTY session (spawns `hermes --tui`)
- `/api/console` — Console engine (in-process)
- `/api/pub` / `/api/events` — Broadcast channels
- `/api/status` — Server status
- `/api/sessions` — Session management
- `/api/models` — Model info
- `/api/config` — Configuration
- `/api/oauth` — OAuth flow
- `/api/profiles` — Profile management

---

## Transport Layers

The gateway protocol is transport-agnostic. The same JSON-RPC framing is used across:

| Transport | Implementation |
|-----------|---------------|
| **WebSocket** | `tui_gateway/ws.py` — FastAPI WebSocket at `/api/ws` |
| **Stdio** | `tui_gateway/transport.py` — `StdioTransport` for TUI |
| **PTY** | `hermes_cli/web_routers/chat_ws.py` — `/api/pty` spawns TUI in PTY |
| **In-process** | `tui_gateway/transport.py` — `FanoutTransport` for desktop embedding |

All transports share the same `dispatch()` function in `tui_gateway/rpc_dispatch.py`.

---

## Contract Generation

- Python defines contracts in `tui_gateway/contracts/` (Pydantic models)
- `scripts/gen_gateway_contracts.py` generates:
  - `apps/shared/src/gateway-contract.generated.ts` — `RpcMethods`, `ServerRequestMap`, `BackendGatewayEventMap` + all value shapes
  - `tui_gateway/contracts/gateway-contract.openrpc.json` — OpenAPI-compatible contract
- Tests in `tests/tui_gateway/contracts/test_generated.py` fail when generated types are stale
- **Workflow**: change Python model → regenerate → `tsc` catches all consumer breaks

---

## Key Files

| File | Purpose |
|------|---------|
| `tui_gateway/ws.py` | WebSocket transport, `/api/ws` mount |
| `tui_gateway/rpc_dispatch.py` | JSON-RPC dispatch, long-handler pool |
| `tui_gateway/server.py` | Method/event registration facade |
| `tui_gateway/contracts/` | Python contract definitions (source of truth) |
| `tui_gateway/transport.py` | Transport abstractions (stdio, websocket, fanout) |
| `hermes_cli/web_routers/chat_ws.py` | FastAPI WebSocket route handler |
| `apps/shared/src/gateway-contract.generated.ts` | Auto-generated TypeScript types |
| `apps/shared/src/json-rpc-gateway.ts` | Gateway client SDK |
| `apps/shared/src/websocket-url.ts` | WebSocket URL resolution |
| `apps/shared/src/gateway-events.ts` | Event map (server + client-local) |
| `apps/shared/src/json-rpc-channel.ts` | JSON-RPC frame types |
| `apps/shared/src/reconnect-backoff.ts` | Reconnection strategy |
| `apps/desktop/src/app/gateway/gateway-event-dedupe.ts` | Event dedup logic |
| `scripts/gen_gateway_contracts.py` | Contract code generator |
