package com.hermes.gateway.chat

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString

class JsonRpcChannel(
    private val url: String = "ws://localhost:8642/api/ws",
    private val authToken: String? = null,
) {
    private val client = OkHttpClient.Builder()
        .pingInterval(25, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private val _connectionState = MutableStateFlow(ConnectionState.Closed)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val coroutineScope = CoroutineScope(Dispatchers.IO + Job())

    var onStreamingText: ((String) -> Unit)? = null
    var onComplete: (() -> Unit)? = null

    private var streamingText = ""

    fun connect() {
        if (webSocket != null) return
        _connectionState.value = ConnectionState.Connecting
        val request = Request.Builder()
            .url(url)
            .apply {
                authToken?.let { header("Authorization", "Bearer $it") }
            }
            .build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                coroutineScope.launch {
                    try {
                        val json = Json.parseToJsonElement(text).jsonObject
                        val result = json["result"]
                        val error = json["error"]
                        if (error != null) {
                            _connectionState.value = ConnectionState.Error
                            return@launch
                        }
                        val payload = result?.jsonObject
                        payload?.let { handleEvent(it) }
                    } catch (_: Exception) {}
                }
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {}

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: okhttp3.Response?) {
                _connectionState.value = ConnectionState.Error
                webSocket.close(1000, null)
                webSocket = null
                coroutineScope.launch {
                    delay(2000)
                    if (_connectionState.value != ConnectionState.Closed) connect()
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                _connectionState.value = ConnectionState.Closed
                webSocket = null
            }
        })
        _connectionState.value = ConnectionState.Connecting
    }

    fun disconnect() {
        webSocket?.close(1000, "client disconnect")
        webSocket = null
        _connectionState.value = ConnectionState.Closed
        coroutineScope.cancel()
    }

    fun sendPrompt(text: String) {
        if (_connectionState.value != ConnectionState.Open) return
        streamingText = ""
        val frame = buildJsonObject {
            put("jsonrpc", "2.0")
            put("method", "prompt.submit")
            put("params", buildJsonObject {
                put("text", text)
                put("session_id", "android-${System.currentTimeMillis()}")
            })
            put("id", System.currentTimeMillis().toString())
        }
        webSocket?.send(Json.encodeToString(frame))
    }

    private fun handleEvent(payload: JsonObject) {
        val eventName = payload["event"]?.jsonPrimitive?.content
            ?: payload["type"]?.jsonPrimitive?.content
        if (eventName == null) {
            val content = payload["content"]?.jsonPrimitive?.content
            if (content != null) {
                val msg = ChatMessage(role = "assistant", text = content, streaming = false)
                _messages.value = listOf(msg)
                onComplete?.invoke()
            }
            return
        }
        when (eventName) {
            "message.delta", "thinking.delta" -> {
                val delta = payload["delta"]?.jsonObject
                val text = delta?.get("text")?.jsonPrimitive?.content ?: ""
                streamingText += text
                val msg = ChatMessage(role = "assistant", text = streamingText, isStreaming = true)
                _messages.value = listOf(msg)
                onStreamingText?.invoke(text)
            }
            "message.complete", "message.interim" -> {
                val delta = payload["delta"]?.jsonObject
                val text = delta?.get("text")?.jsonPrimitive?.content ?: ""
                streamingText += text
                val msg = ChatMessage(role = "assistant", text = streamingText, isStreaming = false)
                _messages.value = listOf(msg)
                onComplete?.invoke()
            }
            else -> {
                val content = payload["content"]?.jsonPrimitive?.content
                    ?: payload["text"]?.jsonPrimitive?.content
                if (content != null) {
val msg = ChatMessage(role = "assistant", text = content, isStreaming = false)
                    _messages.value = listOf(msg)
                    onComplete?.invoke()
                }
            }
        }
    }

    fun isConnected(): Boolean = _connectionState.value == ConnectionState.Open
}

sealed class ConnectionState {
    object Idle : ConnectionState()
    object Connecting : ConnectionState()
    object Open : ConnectionState()
    object Closed : ConnectionState()
    object Error : ConnectionState()
}

data class ChatMessage(
    val role: String,
    val text: String = "",
    val isStreaming: Boolean = false,
)