package com.sambhavai.assistant

import android.os.Bundle
import android.service.voice.VoiceInteractionService

class SamVoiceInteractionService : VoiceInteractionService() {

    override fun onReady() {
        super.onReady()
        // VoiceInteractionService is ready to handle assistant queries and system hotword
    }

    override fun onShutdown() {
        super.onShutdown()
    }

    fun startAssistantSession(args: Bundle? = null) {
        showSession(args ?: Bundle(), 0)
    }
}
