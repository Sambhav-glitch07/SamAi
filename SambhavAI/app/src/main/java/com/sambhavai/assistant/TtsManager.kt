package com.sambhavai.assistant

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

class TtsManager(
    private val context: Context,
    private val memoryManager: MemoryManager,
    private val onSpeechStarted: (() -> Unit)? = null,
    private val onSpeechCompleted: (() -> Unit)? = null
) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false
    private var pendingSpeechText: String? = null

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            applySettings()
            setupProgressListener()

            pendingSpeechText?.let {
                speak(it)
                pendingSpeechText = null
            }
        }
    }

    fun applySettings() {
        tts?.let { engine ->
            val langTag = memoryManager.voiceLanguage
            val locale = when (langTag) {
                "hi-IN" -> Locale("hi", "IN")
                "en-US" -> Locale.US
                else -> Locale("en", "IN")
            }

            val result = engine.setLanguage(locale)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                engine.setLanguage(Locale.US)
            }

            engine.setSpeechRate(memoryManager.speechRate)
            engine.setPitch(memoryManager.speechPitch)
        }
    }

    private fun setupProgressListener() {
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                onSpeechStarted?.invoke()
            }

            override fun onDone(utteranceId: String?) {
                onSpeechCompleted?.invoke()
            }

            override fun onError(utteranceId: String?) {
                onSpeechCompleted?.invoke()
            }
        })
    }

    fun speak(text: String, utteranceId: String = "SAM_UTTERANCE") {
        if (!isInitialized) {
            pendingSpeechText = text
            return
        }
        applySettings()
        val params = Bundle().apply {
            putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
        }
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
    }

    fun stop() {
        tts?.stop()
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isInitialized = false
    }
}
