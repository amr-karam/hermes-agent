package com.hermes.gateway

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.hermes.gateway.chat.ConnectionState
import com.hermes.gateway.chat.HermesChatViewModel
import com.hermes.gateway.ui.ChatScreen
import com.hermes.gateway.ui.HermesTheme

class MainActivity : ComponentActivity() {
    private val viewModel = HermesChatViewModel(application)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HermesTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    val connectionState by viewModel.connectionState.collectAsState()
                    val messages by viewModel.messages.collectAsState()
                    val inputText by viewModel.inputText.collectAsState()
                    ChatScreen(
                        connectionState = connectionState,
                        messages = messages,
                        inputText = inputText,
                        onInputChanged = viewModel::onInputChanged,
                        onSend = viewModel::sendPrompt,
                    )
                }
            }
        }
    }
}