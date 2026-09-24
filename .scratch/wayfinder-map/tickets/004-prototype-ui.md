# Ticket: Prototype Android Companion App UI

## Question

What should the Android companion app's UI look like? Create a low-fidelity prototype.

Specifically:

1. What screens does the MVP need? (Chat screen? Settings? Conversation list?)
2. What is the core interaction flow? (Open app → see conversations → send prompt → receive response)
3. How does the app indicate when the Hermes backend is offline?
4. What does a streaming response look like on a small screen?
5. Do we need a persistent notification for active sessions?
6. What navigation pattern? (Bottom nav, drawer, tab-based?)

## Type: prototype

## Labels: wayfinder:prototype

## Blocking

Block: [Map](#map)

## HITL

This requires a live exchange with the user to validate the UI direction. Create a rough Android Compose mockup to react to.

## Notes

- Consult: jetpack-compose design patterns
- Reference: Hermes desktop app UI for consistency
- The app should feel like a companion, not a clone of the desktop experience
