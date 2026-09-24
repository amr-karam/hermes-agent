package com.hermes.gateway.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import com.hermes.gateway.chat.ChatMessage
import com.hermes.gateway.chat.ConnectionState

@Composable
fun ChatScreen(
    connectionState: ConnectionState,
    messages: List<ChatMessage>,
    inputText: String,
    onInputChanged: (String) -> Unit,
    onSend: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        ConnectionBanner(state = connectionState)
        MessagesList(messages = messages)
        MessageInput(
            text = inputText,
            onTextChange = onInputChanged,
            onSend = onSend,
            enabled = connectionState == ConnectionState.Open,
        )
    }
}

@Composable
fun ConnectionBanner(
    state: ConnectionState,
    modifier: Modifier = Modifier,
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
            if (state != ConnectionState.Open) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = textColor,
                    strokeWidth = 2.dp
                )
                Spacer(Modifier.width(8.dp))
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

@Composable
fun MessagesList(
    messages: List<ChatMessage>,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier
            .weight(1f)
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        items(messages) { message ->
            MessageBubble(message = message)
        }
        if (messages.lastOrNull()?.isStreaming == true) {
            item { StreamingCursor() }
        }
    }
}

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
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.padding(horizontal = 4.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                Text(
                    text = message.text,
                    color = textColor,
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
        }
    }
}

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

@Composable
fun MessageInput(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    enabled: Boolean,
    modifier: Modifier = Modifier,
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
                    capitalization = KeyboardCapitalization.Sentences,
                ),
                shape = MaterialTheme.shapes.extraLarge
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

val ChatMessage.isUser: Boolean
    get() = role == "user"