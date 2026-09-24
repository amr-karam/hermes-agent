# Hermes Agent for Android — UI Prototype

**Type:** Prototype (HITL)
**Status:** Open
**Block:** [Map](../map.md)

---

## Answers to the Six Design Questions

### 1. What screens does the MVP need?

**One screen.** The MVP is a single "Chat" screen. There is no conversation list, no settings page, no history view, and no profile selector.

- The app opens directly into the chat interface.
- Conversations are ephemeral — they exist only in the current session.
- No persistence, no list of past conversations.
- The desktop app has a conversation list sidebar; the Android MVP intentionally omits it to stay focused on the core prompt→response loop.

### 2. Core interaction flow

```
Open App
  → Auto-connect to ws://localhost:8642/api/ws (reuse desktop auth token)
  → Show chat screen with connection status indicator
  → User types prompt → hits Send
  → Prompt appears in chat as user message
  → Response streams in as assistant message (delta by delta)
  → User can type next prompt immediately
```

That's the entire flow. No menus, no taps to navigate, no auth screens.

### 3. How does the app indicate the backend is offline?

**Persistent top banner** (not a snackbar — it must be always-visible):

- **Disconnected** (initial state or lost connection): Red/orange banner spanning the width of the screen, text: "Hermes gateway offline — connecting…" with a pulsing dot indicator.
- **Connecting**: Same banner with animated progress and backoff counter.
- **Reconnected**: Banner smoothly fades out.
- The input field is disabled when offline; the send button is greyed out.
- This is critical because `localhost:8642` means the gateway process must be running — users need to know immediately if it's not.

### 4. Streaming response on a small screen

```
┌──────────────────────┐
│ [Status Banner]      │
├──────────────────────┤
│                      │
│  You: What is        │
│        Kotlin?       │
│                      │
│  Hermes: Kotlin is   │
│          a static    │
│          type...     │
│          <cursor ▌>  │ ← streaming cursor
│                      │
├──────────────────────┤
│ [Input Field ┌─────] │
│       [Send Button]  │
└──────────────────────┘
```

- Messages are **bubbles** aligned left (user) / right (assistant), like messaging apps.
- Streaming text appears **character by character** with a blinking cursor at the end.
- The message list **auto-scrolls** to keep the latest text visible.
- The input field is **pinned at the bottom** — it never scrolls away.
- On a small screen (5") the messages are single-column, full-width bubbles.
- No typing indicator needed — the cursor IS the typing indicator.

### 5. Persistent notification for active sessions?

**No, not for MVP.** Rationale:

- The app is **foreground-only** — no background processing, no background tasks.
- The gateway is local; there's no remote server pushing results.
- When the user leaves the app, the WebSocket disconnects (or stays alive but the UI is gone).
- A persistent notification adds complexity (foreground service, channel setup, lifecycle management) with no user benefit for MVP.
- **Deferred to v2:** If background task support is added (e.g., long-running agent work), a persistent notification becomes essential so the user knows the app is still working.

### 6. Navigation pattern

**No navigation needed.** Single-screen app.

- If we must add a future tab structure, the pattern would be a **Bottom Navigation Bar** with:
  - Tab 1: Chat (default, only populated tab in MVP)
  - Tab 2: Sessions / History (v2)
  - Tab 3: Settings (v2)
- But for MVP, the bottom nav is **absent** — there's nothing to navigate between.
- The only chrome is the **status banner** at top and the **input bar** at bottom.

---

## Jetpack Compose Mockup

### Main Screen: `ChatScreen`

```kotlin
@Composable
fun ChatScreen(
    viewModel: HermesChatViewModel,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // ── Connection Status Banner ──
        ConnectionBanner(
            state = viewModel.connectionState,
            modifier = Modifier.fillMaxWidth()
        )

        // ── Message List ──
        MessagesList(
            messages = viewModel.messages,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
        )

        // ── Input Bar ──
        MessageInput(
            text = viewModel.inputText,
            onTextChange = viewModel::onInputChanged,
            onSend = viewModel::sendPrompt,
            enabled = viewModel.isConnected,
            modifier = Modifier.fillMaxWidth()
        )
    }
}
```

### Connection Banner

```kotlin
@Composable
fun ConnectionBanner(
    state: ConnectionState,
    modifier: Modifier = Modifier
) {
    val backgroundColor = when (state) {
        ConnectionState.Open -> Color.Transparent
        ConnectionState.Connecting -> Color(0xFFFFF3E0)
        ConnectionState.Closed, ConnectionState.Error -> Color(0xFFFFEBEE)
        ConnectionState.Idle -> Color(0xFFFFF3E0)
    }
    val textColor = when (state) {
        ConnectionState.Open -> Color.Transparent
        else -> Color.Red
    }

    Surface(
        color = backgroundColor,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(12.dp)
        ) {
            when (state) {
                ConnectionState.Open -> { /* no indicator */ }
                else -> {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = textColor,
                        strokeWidth = 2.dp
                    )
                    Spacer(Modifier.width(8.dp))
                }
            }
            Text(
                text = when (state) {
                    ConnectionState.Open -> "Connected to Hermes"
                    ConnectionState.Connecting -> "Connecting…"
                    ConnectionState.Idle -> "Waiting for gateway…"
                    ConnectionState.Closed -> "Gateway offline"
                    ConnectionState.Error -> "Connection error"
                },
                color = textColor,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
```

### Messages List

```kotlin
@Composable
fun MessagesList(
    messages: List<ChatMessage>,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        items(messages) { message ->
            MessageBubble(message = message)
        }
        // Streaming cursor indicator
        if (messages.lastOrNull()?.isStreaming == true) {
            item {
                StreamingCursor()
            }
        }
    }
}
```

### Message Bubble

```kotlin
@Composable
fun MessageBubble(message: ChatMessage) {
    val alignment = if (message.isUser) Alignment.CenterEnd else Alignment.CenterStart
    val bgColor = if (message.isUser) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }
    val textColor = if (message.isUser) {
        MaterialTheme.colorScheme.onPrimary
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }

    Row(
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start,
        modifier = Modifier.fillMaxWidth()
    ) {
        Surface(
            color = bgColor,
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (message.isUser) 16.dp else 4.dp,
                bottomEnd = if (message.isUser) 4.dp else 16.dp
            ),
            modifier = Modifier.padding(horizontal = 4.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                Text(
                    text = message.text,
                    color = textColor,
                    style = MaterialTheme.typography.bodyLarge,
                    softWrap = true
                )
            }
        }
    }
}
```

### Streaming Cursor

```kotlin
@Composable
fun StreamingCursor() {
    Row(
        horizontalArrangement = Arrangement.Start,
        modifier = Modifier.padding(start = 4.dp)
    ) {
        Text(
            text = "Hermes ▌",
            color = MaterialTheme.colorScheme.primary,
            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
        )
    }
}
```

### Message Input Bar

```kotlin
@Composable
fun MessageInput(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    enabled: Boolean,
    modifier: Modifier = Modifier
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(4.dp)
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = onTextChange,
                placeholder = { Text("Message Hermes…") },
                singleLine = true,
                modifier = Modifier
                    .weight(1f)
                    .padding(end = 8.dp),
                enabled = enabled,
                maxLines = 4,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Sentences
                ),
                shape = RoundedCornerShape(20.dp)
            )
            IconButton(
                onClick = onSend,
                enabled = enabled && text.isNotBlank(),
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}
```

---

## Wireframe Summary

```
┌─────────────────────────┐
│ ╔═══════════════════════╗│
│ ║ 🟢 Connected        ║│  ← Connection Banner
│ ╚═══════════════════════╝│
│                         │
│  ┌───────────────────┐  │
│  │ You: Hello!       │  │  ← User message (right-aligned)
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Hermes: Hello!    │  │  ← Assistant message (left-aligned)
│  │ How can I help?   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Hermes: Kotlin i│▌ │  │  ← Streaming response (cursor at end)
│  │ s a statically t│  │
│  └───────────────────┘  │
│                         │
│ ┌─────────────────────┐ │
│ │ Message Hermes… [→] │ │  ← Input bar (pinned bottom)
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Screen count | **1** | MVP is pure prompt→response, no chrome |
| Message layout | **Bubble + alignment** | Familiar messaging pattern, works at any size |
| Connection status | **Persistent banner** | Local gateway can disappear; user must know |
| Streaming indicator | **Blinking cursor in message** | No separate typing indicator needed; minimal screen real estate |
| Navigation | **None** | Single screen, zero navigation overhead |
| Notification | **None** | Foreground-only, no background work |
| Input | **Single text field + send** | Voice/image input deferred to v2 |
| History | **None** | Ephemeral conversations; persistence is v2 |
| Auth | **Hidden** | Reuse desktop token, no login screen |

---

## Open Questions for HITL Discussion

- **Should the status banner be dismissible once connected?** (Currently: it stays as a thin line, not dismissible)
- **Should there be a character limit on input?** (Currently: none, but very long prompts on mobile could be an issue)
- **Should streaming text have a "copy" action when complete?** (Currently: not in MVP, but would be a simple addition)
- **Dark mode support?** (Currently: follows system theme via MaterialTheme — no manual toggle)
- **Should the input bar support markdown formatting?** (Currently: plain text only, markdown rendering deferred to v2)
