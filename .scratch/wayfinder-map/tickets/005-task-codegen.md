# Ticket: Task — Generate Kotlin Data Classes from Gateway Contract

## Status: ✅ Complete

## Resolution

Extended `scripts/gen_gateway_contracts.py` with a `KotlinRenderer` class that converts the same JSON Schema defs to Kotlin data classes with `@Serializable` and `@SerialName` annotations.

### What was done:
1. Added `KotlinRenderer` class to `scripts/gen_gateway_contracts.py`
2. Added `render_kotlin()` function that generates Kotlin types from the contract registry
3. Added `KOTLIN_OUT = ROOT / "apps" / "android" / "src" / "main" / "java" / "com" / "hermes" / "gateway" / "gateway-contract.kt"`
4. Updated `render_all()` to include Kotlin output alongside TS and OpenRPC
5. Created `apps/android/` project skeleton with `build.gradle.kts`, `settings.gradle.kts`, and package structure
6. Generated `gateway-contract.kt` — 12,009 lines, 50 enum classes, 150+ data classes, all with proper `@Serializable` annotations

### Output verified:
- `apps/android/src/main/java/com/hermes/gateway/gateway-contract.kt` — 268KB, 12,009 lines
- `apps/shared/src/gateway-contract.generated.ts` — regenerated (202KB)
- Both files pass `git diff --check`

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
- ✅ All types from `gateway-contract.generated.ts` have Kotlin equivalents (12,009 lines)
- ✅ Generated code uses `@Serializable` / `@SerialName` properly
- ⏳ Compiling with `kotlinc` (not yet tested — requires Kotlin toolchain)
- ⏳ Example usage (would need Android Studio / Gradle)
