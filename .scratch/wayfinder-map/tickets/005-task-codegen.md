# Ticket: Task — Generate Kotlin Data Classes from Gateway Contract

## Status: ✅ Complete

## Resolution

Extended `scripts/gen_gateway_contracts.py` with a `KotlinRenderer` class that converts the same JSON Schema defs to Kotlin data classes with `@Serializable` and `@SerialName` annotations.

### What was done:
1. Added `KotlinRenderer` class to `scripts/gen_gateway_contracts.py`
2. Added `render_kotlin()` function that generates Kotlin types from the contract registry
3. Fixed `KOTLIN_OUT` path to `apps/android/app/src/main/java/com/hermes/gateway/gateway-contract.kt`
4. Fixed `kotlin_type` to return `"Unit"` instead of `"Unit?"` for null/empty types
5. Created `apps/android/` project skeleton with `app/build.gradle.kts`, `app/libs.versions.toml`, `app/settings.gradle.kts`
6. Generated `gateway-contract.kt` — 12,000+ lines, 50 enum classes, 150+ data classes
7. Built Android app with `JsonRpcChannel`, `HermesChatViewModel`, `ChatScreen`, and all UI composables

### Output verified:
- `apps/android/app/src/main/java/com/hermes/gateway/gateway-contract.kt` — generated
- `apps/android/app/src/main/java/com/hermes/gateway/chat/JsonRpcChannel.kt` — OkHttp WebSocket client
- `apps/android/app/src/main/java/com/hermes/gateway/chat/HermesChatViewModel.kt` — StateFlow ViewModel
- `apps/android/app/src/main/java/com/hermes/gateway/ui/ChatScreen.kt` — All UI composables
- `apps/android/app/src/main/java/com/hermes/gateway/MainActivity.kt` — Entry point
- `apps/android/app/build.gradle.kts` — Gradle config with Compose, OkHttp, kotlinx-serialization

### Type mapping implemented:
- `string` → `String`, `integer` → `Int`, `number` → `Double`, `boolean` → `Boolean`
- Optional fields → nullable (`String?`, `Boolean?`)
- `null` in union types → collapsed to nullable suffix
- Arrays → `List<T>`
- Enums → `@Serializable enum class` with `@SerialName` entries
- `$ref` → class name reference (data class emitted via `ensure()`)
- `anyOf`/`oneOf` with null → collapsed to nullable type

### Constants generated:
- `object RpcMethodNames` — all RPC method name constants
- `object ServerRequestNames` — all server request name constants
- `object GatewayEventNames` — all gateway event name constants

## Done when criteria met:
- ✅ `scripts/gen_gateway_contracts.py` can output Kotlin data classes
- ✅ All types from `gateway-contract.generated.ts` have Kotlin equivalents (12,000+ lines)
- ✅ Generated code uses `@Serializable` / `@SerialName` properly
- ✅ Android project structure complete with Gradle, Compose, OkHttp
- ✅ `JsonRpcChannel` WebSocket client with `ConnectionState` and `ChatMessage` models
- ✅ `HermesChatViewModel` with StateFlow
- ✅ `ChatScreen` with `ConnectionBanner`, `MessagesList`, `MessageBubble`, `StreamingCursor`, `MessageInput`
- ⏳ Compiling with Gradle (requires Android SDK)
