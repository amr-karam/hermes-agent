package com.hermes.gateway.chat

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HermesChatViewModel(application: Application) : AndroidViewModel(application) {
    private val channel = JsonRpcChannel()

    private val _connectionState = MutableStateFlow(ConnectionState.Closed)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _inputText = MutableStateFlow("")
    val inputText: StateFlow<String> = _inputText.asStateFlow()

    init {
        channel.connect()
        channel.connectionState.collect { state ->
            _connectionState.value = when (state) {
                ConnectionState.Open -> ConnectionState.Open
                ConnectionState.Connecting -> ConnectionState.Connecting
                ConnectionState.Closed -> ConnectionState.Closed
                ConnectionState.Error -> ConnectionState.Error
                else -> ConnectionState.Closed
            }
        }
        channel.messages.collect { messages ->
            _messages.value = messages
        }
    }

    fun onInputChanged(text: String) {
        _inputText.value = text
    }

    fun sendPrompt() {
        val text = _inputText.value.trim()
        if (text.isEmpty()) return
        _inputText.value = ""
        channel.sendPrompt(text)
    }

    fun isConnected(): Boolean = _connectionState.value == ConnectionState.Open

    override fun onCleared() {
        super.onCleared()
        channel.disconnect()
    }
}