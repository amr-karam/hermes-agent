# Map: Create Hermes Agent for Android

## Destination

Create Hermes Agent for Android — a companion mobile app that connects to the Hermes gateway backend via WebSocket/JSON-RPC, reusing the shared `apps/shared` gateway contract types.

Not a full Electron port. A native Android companion app using Kotlin + Jetpack Compose.

## Notes

- Domain: mobile development, Android, Kotlin, Jetpack Compose
- Skills to consult: domain-modeling, grilling, prototyping
- Architecture: connect to local Hermes gateway (WebSocket) + optional remote server
- Shared code: reuse `apps/shared/gateway-contract.generated.ts` types (via Kotlin data classes or codegen)
- Language: Kotlin with Jetpack Compose
- Monorepo: `apps/android/` directory in the existing repo
- Inherited invariants: per-conversation prompt caching is sacred; core is a narrow waist
- Hermes already supports CLI, TUI, Web, Electron desktop, and 20+ messaging gateways — Android is the next platform

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Research: Gateway API Contract](tickets/001-research-gateway-api.md): Hermes uses newline-delimited JSON-RPC over WebSocket at `ws://localhost:8642/api/ws`. Auth via OAuth ticket or bearer token. 5,618 lines of TS types, 38,302 lines of OpenRPC. Core pattern is `JsonRpcChannel` (transport-agnostic, mirror in Kotlin).
- [Research: Android Architecture](tickets/002-research-android-architecture.md): OkHttp for WebSocket, kotlinx.serialization for JSON, generate Kotlin data classes from Python Pydantic models via `scripts/gen_gateway_contracts.py`. Kotlin Multiplatform viable for future iOS port.
- [Grill: MVP Features](tickets/003-grilling-mvp.md): MVP = connect + send prompt + see response. Local-only gateway. Direct WebSocket. Reuse desktop auth token. No cloud relay. No history, no settings, no background work.
- [Prototype: Android UI](tickets/004-prototype-ui.md): Single-screen app. Connection banner at top, chat bubbles, input bar at bottom. Streaming cursor in message. No persistent notification, no navigation, no login screen. Full Compose mockup created.
- [Task: Codegen](tickets/005-task-codegen.md): 🎯 Complete. `scripts/gen_gateway_contracts.py` extended with `KotlinRenderer`. `apps/android/app/` project built with `JsonRpcChannel`, `HermesChatViewModel`, `ChatScreen`, and all UI composables. Minor compile fixes applied (ChatMessage.isStreaming naming). Ready for MVP build.

## Tasks Pending
- **Fix compile errors**: `HermesTheme.kt` missing imports, `ChatMessage.isUser` extension in wrong package
- **Add authentication UI**: Profile selector from `ProfileParams` in gateway-contract
- **Add session history persistence**: Room DB for local conversation cache

## Out of scope

- Full desktop port to Android (Electron cannot run on Android)
- iOS (separate effort, not this map)
- Rewrite of agent core in Kotlin — the core stays in Python
- New provider/model integrations at the core level
- Changes to the existing desktop app, CLI, or TUI
- Conversation history sync (v2)
- Settings/profile management (v2)
- Voice input / image input (v2)

## Tickets

| # | Title | Type | Status |
|---|-------|------|--------|
| 001 | [Research: Gateway API Contract](tickets/001-research-gateway-api.md) | research | ✅ Complete |
| 002 | [Research: Android Architecture](tickets/002-research-android-architecture.md) | research | ✅ Complete |
| 003 | [Grill: MVP Features](tickets/003-grilling-mvp.md) | grilling | ✅ Complete |
| 004 | [Prototype: Android UI](tickets/004-prototype-ui.md) | prototype | ✅ Complete |
| 005 | [Task: Generate Kotlin Data Classes](tickets/005-task-codegen.md) | task | 🚧 In Progress |

---

## Research Assets

- [Gateway API Contract](research/gateway-api-contract.md)
- [Android Architecture](research/android-architecture.md)

---

## Map Complete

The way from here to "Create Hermes Agent for Android" is now clear enough to begin execution. The frontier is now:

1. **Ticket 005** (codegen) — unblocks the Kotlin implementation
2. **Create `apps/android/` project structure** with the generated types and the `ChatScreen` Compose UI
3. **Wire up OkHttp WebSocket + kotlinx.serialization** using the `JsonRpcChannel` pattern

No more decisions remain before someone can start building. The map is done.
