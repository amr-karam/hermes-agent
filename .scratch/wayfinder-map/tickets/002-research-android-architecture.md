# Ticket: Research Android Communication Architecture

## Question

What is the best approach for a Kotlin Android app to communicate with the Hermes Python gateway? Specifically:

1. Should we use a native Kotlin WebSocket client (okhttp) or a gRPC bridge?
2. How to handle JSON-RPC over WebSocket in Kotlin?
3. Should we generate Kotlin data classes from `gateway-contract.generated.ts` (codegen) or hand-write them?
4. What library for JSON serialization in Kotlin? (kotlinx.serialization, Gson, Moshi?)
5. How to handle connection lifecycle (reconnect, auth refresh)?
6. Is Kotlin Multiplatform relevant here (shared logic with iOS later)?

## Type: research

## Labels: wayfinder:research

## Blocking

Block: [Map](#map)

## Research needed

- Look at okhttp WebSocket client examples
- Research kotlinx.serialization for JSON-RPC
- Check if `gateway-contract.generated.ts` can be auto-converted to Kotlin data classes
- Look at existing Kotlin WebSocket + JSON-RPC projects on GitHub
- Research if Kotlin Multiplatform would help with future iOS port
