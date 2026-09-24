# Ticket: Research Gateway API Contract for Android

## Question

What is the exact WebSocket/JSON-RPC protocol the Hermes gateway uses, and how can a Kotlin client implement it? Specifically:

1. What is the WebSocket endpoint URL and connection lifecycle?
2. What JSON-RPC methods are available (from `gateway-contract.generated.ts`)?
3. What is the authentication flow (token-based, session-based)?
4. What events does the gateway push vs. what does the client request?
5. Is there a REST fallback or is it WebSocket-only?

## Type: research

## Labels: wayfinder:research

## Blocking

Block: [Map](#map)

## Research needed

- Read `apps/shared/src/gateway-contract.generated.ts` for the RPC method definitions
- Read `tui_gateway/` Python source for WebSocket protocol details
- Read `apps/desktop/src/` for how the desktop app connects to the gateway
- Check if there's an existing Kotlin/Java JSON-RPC client library
- Look at `apps/shared/src/gateway-events.ts` for event types
