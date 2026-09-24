# Wayfinder Map Research: Kotlin Android ↔ Hermes Python Gateway

## 1. Gateway Contract Scale

The `gateway-contract.generated.ts` file is **5,618 lines** and the `gateway-contract.openrpc.json` is **38,302 lines**. This is auto-generated from Python Pydantic models in `tui_gateway/contracts/` by `scripts/gen_gateway_contracts.py`.

The contract defines:
- **~150+ RPC methods** (client→server) with `Params` and `Result` types each
- **~50 server→client request types** (approval, clarify, sudo, connection operations, etc.)
- **~40 event types** (gateway.ready, message.delta, tool.start, billing updates, etc.)
- **Hundreds of interfaces/enums** spanning billing, subscriptions, connectors, display, groups, bot relay, browser control, sessions, and more

**Key implication**: Manual translation of all types to Kotlin is infeasible and will drift. Code generation from the Python contracts is mandatory.

### Contract Structure Highlights
- All types have `profile?: string | null` as an optional first parameter on every method
- Money is represented as strings (not numbers) to avoid precision loss
- Many interfaces have `[key: string]: unknown` for extensibility
- `extra="forbid"` enforced on Pydantic models (the generator propagates this)
- The contract is the **single source of truth** — Python defines, TypeScript consumes

---

## 2. Current Architecture (TypeScript Reference)

The desktop app and web dashboard share a framework-agnostic JSON-RPC client stack in `apps/shared/src/`:

### Transport Layer
- **`JsonRpcRequestChannel`** (576 lines) — Transport-agnostic JSON-RPC protocol engine:
  - Request/response correlation with pending call map
  - Per-call timeouts (default 120s) and AbortSignal support
  - Heartbeat via `gateway.ping` (15s interval, 45s deadline)
  - Server→client request dispatch with `respond`/`fail` callbacks
  - `JsonRpcTransport` interface — any text sink (WebSocket, stdio, test spy)

### WebSocket Client Layer
- **`JsonRpcGatewayClient`** (625 lines) — WebSocket connection manager:
  - State machine: `idle → connecting → open → closed → error`
  - Automatic reconnect with exponential backoff + full jitter (base 300ms, cap 15s, stable-open threshold 5s)
  - Lossless reconnect replay: tracks per-session event seq numbers, fetches `session.events.since` after reconnect
  - Replay epoch tracking to detect backend restarts
  - `GatewayEventHub` for typed fan-out of event notifications
  - `socketFactory` injection for testing/custom WebSocket implementations

### Reconnect Strategy (`reconnect-backoff.ts`)
- Exponential backoff: `min(capMs, baseDelayMs * 2^attempt)` with full jitter
- Jitter prevents reconnect storms across multiple clients
- `isStableOpen()` resets the ladder only after 5s of continuous uptime
- Default cap: 15 seconds, base: 300ms

### WebSocket URL Construction (`websocket-url.ts`)
- `buildHermesWebSocketUrl()` constructs `ws://`/`wss://` URLs from protocol, host, path, and auth params
- OAuth-gated gateways use single-use tickets; `resolveGatewayWsUrl()` mints fresh URLs
- `GatewayReauthRequiredError` is thrown when OAuth session expires

---

## 3. Python Backend Architecture

The `tui_gateway/` directory contains the Python JSON-RPC server:

- **`server.py`** (3,393 lines) — Facade with method registry, session management, dispatch
- **`ws.py`** (408 lines) — WebSocket transport (Starlette-based), `WSTransport` class with token coalescing, send locks, TCP_NODELAY
- **`contracts/`** (19 modules) — Pydantic models defining every method's Params/Result and event Payload types
- **`rpc_dispatch.py`** — Method dispatch table
- **`transport.py`** — Transport abstraction (StdioTransport, FanoutTransport)
- **`session_transports.py`** — Session lifecycle and transport registration

Wire protocol: **newline-delimited JSON-RPC 2.0** over WebSocket (or stdio for TUI). Every frame is `{"jsonrpc": "2.0", "id": ..., "method": ..., "params": ...}` or `{"jsonrpc": "2.0", "result": ..., "id": ...}` or `{"jsonrpc": "2.0", "method": "event", "params": {type: ..., ...}}`.

---

## 4. Recommendations

### 4.1 Kotlin WebSocket Client Library

**Recommendation: OkHttp**

| Criteria | OkHttp | Ktor Client | Java-WebSocket |
|---|---|---|---|
| WebSocket support | ✅ First-class | ✅ Via plugin | ✅ Standalone |
| Android maturity | ✅ Industry standard | ✅ Good | ✅ |
| Coroutine support | ✅ `okhttp-coroutines` | ✅ Native | ❌ Callback-only |
| JSON-RPC extensibility | ✅ Interceptors | ✅ Plugins | ⚠️ Limited |
| Connection lifecycle control | ✅ Fine-grained | ✅ Good | ⚠️ Basic |
| Binary frame support | ✅ | ✅ | ⚠️ |
| Dependency footprint | ~1.5MB | ~2MB | ~200KB |
| Background thread management | ✅ Built-in | ✅ | ❌ Manual |

**Why OkHttp over Ktor:**
- OkHttp's `WebSocket` API is lower-level and more controllable, matching the JSON-RPC pattern where you need raw text frame management
- OkHttp's `Interceptors` are ideal for adding auth token injection, logging, and reconnect logic transparently
- `okhttp-coroutines` provides clean `suspend` functions for request/response patterns
- Smaller dependency tree; no need for the full Ktor HTTP engine when you only need WebSocket
- Better Android-specific features (connection pooling, certificate pinning)

**Why not Java-WebSocket:**
- Callback-based API is error-prone for complex request/response correlation
- No built-in coroutine support
- Lacks connection lifecycle management features needed for production

**Recommended dependency:**
```kotlin
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("com.squareup.okhttp3:okhttp-coroutines:1.1.0")
```

### 4.2 JSON-RPC over WebSocket in Kotlin

Model the architecture directly after the TypeScript reference:

```kotlin
// Transport-agnostic interface (mirrors JsonRpcTransport)
interface JsonRpcTransport {
    suspend fun send(text: String)
    fun close()
}

// JSON-RPC frame model
data class JsonRpcFrame<T>(
    val jsonrpc: String = "2.0",
    val id: String?,
    val method: String?,
    val params: T?,
    val result: Any?,
    val error: JsonRpcError?
)

data class JsonRpcError(
    val code: Int?,
    val message: String?,
    val data: Any?
)
```

**Architecture layers (mirroring the TS codebase):**

1. **`JsonRpcChannel`** — Transport-agnostic protocol engine:
   - `PendingCall` map with request ID → Deferred
   - `send(frame)` / `handleFrame(text)` methods
   - Heartbeat timer (`gateway.ping` every 15s, 45s deadline)
   - Per-call timeouts and AbortSignal support
   - Server→client request dispatch with `respond`/`fail`
   - `attach(transport)` / `detach(error)` lifecycle

2. **`GatewayClient`** — OkHttp WebSocket wrapper:
   - Connection state machine: `Idle → Connecting → Open → Closed → Error`
   - OkHttp `WebSocket` with `WebSocketListener` for message/close/failure events
   - Reconnect with exponential backoff + jitter (port from `reconnect-backoff.ts`)
   - Lossless replay: track per-session seq, call `session.events.since` on reconnect
   - `GatewayEventHub` for typed event fan-out
   - `socketFactory` injection for testing

3. **`GatewayEvent`** — Typed event envelope (mirrors `GatewayEvent<K>`):
   ```kotlin
   data class GatewayEvent<K>(
       val type: K,
       val payload: Any?,
       val seq: Long?,
       val sessionId: String?,
       val replayed: Boolean = false,
       val replayEpoch: String? = null
   )
   ```

### 4.3 Generating Kotlin Data Classes from gateway-contract.generated.ts

**Yes, generate Kotlin data classes. Do not translate manually.**

The contract is 5,618 lines with ~150+ types. Manual translation will drift and become unmaintainable.

**Generation strategy (recommended):**

Option A: **Generate from Python Pydantic models** (best — mirrors existing pipeline)
- The existing `scripts/gen_gateway_contracts.py` already generates TypeScript from Python Pydantic models
- Add a Kotlin code generator to the same script (or a parallel script)
- Pydantic models → Kotlin data classes via a custom serializer
- Use `kotlinx.serialization` annotations in generated code
- This keeps Python as the single source of truth, matching the existing workflow

Option B: **Generate from the generated TypeScript** (fallback)
- Parse `gateway-contract.generated.ts` with a TypeScript AST parser (e.g., `ts-morph` or `typescript` npm package)
- Transform TypeScript interfaces to Kotlin data classes
- Run as a Node.js script in the build pipeline
- Less ideal because TypeScript is a generated artifact; but avoids depending on Python at generation time

Option C: **Generate from OpenAPI spec** (if `gateway-contract.openrpc.json` is sufficient)
- The `gateway-contract.openrpc.json` (38K lines) is an OpenAPI-compliant spec
- Use an OpenAPI-to-Kotlin code generator (e.g., `openapi-generator`, `kotlin-openapi`)
- This is the most mature tooling path but may not capture all nuances (custom enums, discriminators)

**Recommended approach: Option A** (Python → Kotlin) because:
1. It matches the existing code generation pipeline exactly
2. Python Pydantic models are the canonical source
3. `tests/tui_gateway/contracts/test_generated.py` already validates the TS output; extend to validate Kotlin
4. One script generates both TS and Kotlin, ensuring they stay in sync

**Generated Kotlin code should use:**
```kotlin
@Serializable
data class SessionLiveInfo(
    val model: String? = null,
    val provider: String? = null,
    val reasoningEffort: String? = null,
    // ... all fields with proper types
    val [key: string]: unknown  // → Map<String, Any>? for extensibility
)
```

**Handling TypeScript-specific patterns in Kotlin:**
- `type X = 'a' | 'b'` → Kotlin `sealed class` or `@Serializable enum class`
- `Record<string, unknown>` → `Map<String, Any>` or `@Serializable(with = ...)` 
- `X | null` → Nullable types `X?`
- `[key: string]: unknown` → `@Serializable(with = UnknownMapSerializer::class)` or `Map<String, Any>`
- `string | number` → Custom serializer or `@JsonAny` pattern

### 4.4 JSON Serialization Library

**Recommendation: kotlinx.serialization**

| Criteria | kotlinx.serialization | Gson | Moshi |
|---|---|---|---|
| Kotlin-first | ✅ Native | ⚠️ Java-first | ⚠️ Java-first |
| Coroutine-friendly | ✅ | ❌ | ❌ |
| Code generation | ✅ `@Serializable` + ksp | ❌ Reflection | ⚠️ Adapter generation |
| Proguard/R8 support | ✅ | ⚠️ Requires keep rules | ✅ |
| Android size | ~180KB | ~250KB | ~150KB |
| Polymorphic serialization | ✅ Built-in | ❌ | ❌ |
| Null safety | ✅ First-class | ❌ | ❌ |
| Custom serializers | ✅ First-class | ⚠️ | ⚠️ |
| JSON-RPC frame handling | ✅ `JsonElement` | ✅ | ✅ |

**Why kotlinx.serialization:**
- First-class Kotlin support with `@Serializable` annotations
- Code generation via KSP avoids reflection overhead (important for Android)
- `kotlinx.serialization.json` provides `JsonElement`, `JsonPrimitive`, `JsonObject` for dynamic JSON-RPC frames
- Polymorphic serialization handles the many union types in the contract (e.g., `SubscriptionChangeEffect`)
- Built-in null safety matches Kotlin's type system
- `Json { ignoreUnknownKeys = true }` configuration handles the `[key: string]: unknown` extensibility pattern
- No reflection = better performance on Android and smaller DEX size
- The Kotlin Multiplatform story is native (no separate iOS implementation needed)

**Recommended setup:**
```kotlin
plugins {
    kotlin("plugin.serialization") version "1.9.22"
    kotlin("plugin.compose") version "1.5.8" // if using Compose Multiplatform
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.6.0")
}
```

**For JSON-RPC frame parsing**, use `JsonElement` directly:
```kotlin
val frame: JsonElement = json.decodeFromString(text)
val obj = frame.jsonObject
val id = obj["id"]?.jsonPrimitive?.content
val method = obj["method"]?.jsonPrimitive?.content
```

### 4.5 Connection Lifecycle Management

Based on the TypeScript reference (`json-rpc-gateway.ts` + `reconnect-backoff.ts`):

**State Machine:**
```kotlin
sealed class ConnectionState {
    object Idle : ConnectionState()
    class Connecting(val attempt: Int) : ConnectionState()
    class Open(val connectedAt: Instant) : ConnectionState()
    class Closed(val reason: String?) : ConnectionState()
    class Error(val error: String) : ConnectionState()
}
```

**Reconnect Strategy:**
- Exponential backoff with full jitter (base 300ms, cap 15s)
- `isStableOpen()` check: only reset backoff after 5s of continuous uptime
- Maximum reconnect attempts should be bounded (configurable, default: unlimited with cap)
- On reconnect: fetch `session.events.since` with last-known seq numbers for lossless replay
- Track `replayEpoch` to detect backend restarts
- Dedup: use a generation counter to invalidate stale reconnect attempts

**Auth Refresh:**
- OAuth-gated gateways use single-use tickets
- `resolveGatewayWsUrl()` pattern: mint a fresh URL immediately before opening the socket
- On `GatewayReauthRequiredError`, trigger re-authentication flow
- Token-based auth: pass token as WebSocket query parameter (e.g., `?token=xxx`)
- Single-use tickets must never be cached; always mint fresh

**Heartbeat:**
- `gateway.ping` every 15 seconds (configurable)
- 45-second deadline (configurable)
- `any-inbound` liveness mode: any frame resets the deadline (matches TS behavior)
- After missed deadline → close socket → trigger reconnect

**Server→Client Requests:**
- The Kotlin client must handle `server.request` frames (clarify, approval, sudo, etc.)
- `onRequest` callback with `respond`/`fail` methods (mirrors `ServerRequestHandler`)
- Re-delivery after reconnect via `open_requests` in `session.events.since` responses

**Key implementation notes:**
```kotlin
class JsonRpcGatewayClient(
    private val client: OkHttpClient,
    private val json: Json,
    private val baseUrl: String,
    private val authTokenProvider: () -> String,
) {
    private var webSocket: WebSocket? = null
    private var state: ConnectionState = ConnectionState.Idle
    private val channel = JsonRpcChannel(json)
    private val eventHub = GatewayEventHub()
    private val seqWatermarks = mutableMapOf<String, Long>()
    private var replayEpoch: String? = null
    private var replayGeneration = 0
    
    // Reconnect with backoff
    suspend fun connect() { ... }
    suspend fun reconnect(attempt: Int) { ... }
    fun invalidate() { ... }
    
    // Request/response
    suspend fun <T> request(method: String, params: Map<String, Any>): T { ... }
    
    // Events
    fun onEvent(type: String, handler: (GatewayEvent) -> Unit): Disposable { ... }
    fun onRequest(handler: ServerRequestHandler): Disposable { ... }
}
```

### 4.6 Kotlin Multiplatform Relevance

**Yes, Kotlin Multiplatform is highly relevant for future iOS port.**

**Strategy: Share the `JsonRpcChannel` and gateway contract, keep platform-specific networking separate.**

```
shared/
  ├── src/commonMain/
  │   ├── jsonrpc/JsonRpcChannel.kt      ← Transport-agnostic, fully shared
  │   ├── jsonrpc/GatewayEvent.kt        ← Event types, fully shared
  │   ├── model/                         ← Generated data classes, fully shared
  │   └── util/ReconnectBackoff.kt       ← Backoff logic, fully shared
  ├── src/androidMain/
  │   └── network/OkHttpTransport.kt     ← OkHttp WebSocket implementation
  ├── src/iosMain/
  │   └── network/CfNetworkTransport.kt  ← CFNetwork WebSocket implementation
  └── src/nativeMain/
      └── network/NativeWebSocketTransport.kt
```

**What to share:**
- `JsonRpcChannel` — Pure Kotlin, no platform dependencies
- All generated data classes from the contract
- `ReconnectBackoff` logic
- `GatewayEventHub` and event types
- `JsonRpcGatewayClient` state machine logic (with platform-specific transport injected)
- JSON serialization config

**What to keep platform-specific:**
- WebSocket implementation (OkHttp vs CFNetwork)
- Coroutine/dispatcher setup
- HTTP auth token minting
- Network reachability monitoring
- Secure storage for auth tokens (Android Keystore vs iOS Keychain)

**Kotlin Multiplatform considerations:**
- `kotlinx-serialization` is fully multiplatform ✅
- `kotlinx.coroutines` is fully multiplatform ✅
- WebSocket APIs differ: OkHttp on Android, `kotlinx.coroutines.channels` + CFNetwork on iOS
- Use `expect`/`actual` for the transport layer
- The `JsonRpcTransport` interface is the abstraction boundary

**If not using KMP immediately:**
- Still design the architecture with `JsonRpcTransport` as the interface
- Keep all business logic in a `commonMain`-compatible module
- This way, adding iOS later is a matter of implementing the transport, not rewriting logic
- Even without KMP, the `@Serializable` data classes can be used on Android and later shared

**Recommended approach:** Start with pure Android, but structure the code as if KMP:
1. Create a `hermes-gateway-core` module with all non-networking logic
2. Create a `hermes-gateway-android` module that depends on core + OkHttp
3. When iOS is needed, create `hermes-gateway-ios` that depends on core + CFNetwork
4. This avoids the complexity of full KMP setup while preserving the architecture

---

## 5. Summary of Recommendations

| Decision | Recommendation |
|---|---|
| WebSocket library | **OkHttp** (with okhttp-coroutines) |
| JSON-RPC approach | Transport-agnostic `JsonRpcChannel` + OkHttp `WebSocketListener` |
| Data class generation | **Generate from Python Pydantic models** (extend `gen_gateway_contracts.py`) |
| JSON serialization | **kotlinx.serialization** (with KSP code generation) |
| Connection lifecycle | State machine + exponential backoff with jitter + replay epoch tracking |
| Kotlin Multiplatform | **Highly relevant** — share core logic, platform-specific transport |
| Contract size | **5,618 lines TS / 38,302 lines OpenRPC** — ~150+ types, code generation mandatory |

---

## 6. Key Files to Reference

| File | Purpose |
|---|---|
| `apps/shared/src/json-rpc-channel.ts` | Transport-agnostic JSON-RPC protocol engine (576 lines) |
| `apps/shared/src/json-rpc-gateway.ts` | WebSocket client with reconnect, replay, heartbeat (625 lines) |
| `apps/shared/src/reconnect-backoff.ts` | Exponential backoff with full jitter |
| `apps/shared/src/websocket-url.ts` | WebSocket URL construction and OAuth refresh |
| `apps/shared/src/gateway-events.ts` | Gateway event type definitions |
| `apps/shared/src/gateway-contract.generated.ts` | Auto-generated TypeScript types (5,618 lines) |
| `apps/shared/src/index.ts` | Public API exports for `@hermes/shared` |
| `tui_gateway/server.py` | Python JSON-RPC server facade (3,393 lines) |
| `tui_gateway/ws.py` | WebSocket transport implementation (408 lines) |
| `tui_gateway/contracts/` | Python Pydantic models (19 modules) |
| `scripts/gen_gateway_contracts.py` | Contract generation script (366 lines) |
| `tui_gateway/AGENTS.md` | TUI gateway architecture documentation |
| `apps/desktop/AGENTS.md` | Desktop engineering guide |