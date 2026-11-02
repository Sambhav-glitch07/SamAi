package com.sambhavai.assistant

import android.content.Intent
import android.speech.RecognitionService

class SamRecognitionService : RecognitionService() {

    override fun onStartListening(recognizerIntent: Intent?, listener: Callback?) {
        // Recognition service delegate
    }

    override fun onCancel(listener: Callback?) {
        // Cancel speech listening
    }

    override fun onStopListening(listener: Callback?) {
        // Stop speech listening
    }
}
