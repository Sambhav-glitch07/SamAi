package com.sambhavai.assistant

import android.content.Context
import android.os.Bundle
import android.service.voice.VoiceInteractionSession
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import com.sambhavai.assistant.ui.AssistantOrbView
import com.sambhavai.assistant.ui.AssistantState
import com.sambhavai.assistant.ui.GlowingBorderView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SamVoiceInteractionSession(context: Context) : VoiceInteractionSession(context) {

    private val memoryManager = MemoryManager(context)
    private val phoneActions = PhoneActions(context)
    private val commandManager = CommandManager(phoneActions)
    private val aiManager = AIManager(context, memoryManager)

    private val sessionScope = CoroutineScope(Dispatchers.Main)

    private var orbView: AssistantOrbView? = null
    private var borderView: GlowingBorderView? = null
    private var tvStatus: TextView? = null
    private var tvQuery: TextView? = null
    private var tvResponse: TextView? = null

    private var speechManager: SpeechManager? = null
    private var ttsManager: TtsManager? = null

    override fun onCreateContentView(): View {
        val view = LayoutInflater.from(context).inflate(R.layout.session_assistant, null)

        orbView = view.findViewById(R.id.sessionOrbView)
        borderView = view.findViewById(R.id.sessionGlowingBorder)
        tvStatus = view.findViewById(R.id.tvSessionStatus)
        tvQuery = view.findViewById(R.id.tvSessionQuery)
        tvResponse = view.findViewById(R.id.tvSessionResponse)

        view.findViewById<ImageButton>(R.id.btnSessionClose).setOnClickListener {
            hide()
        }

        initVoiceEngines()
        return view
    }

    private fun initVoiceEngines() {
        ttsManager = TtsManager(
            context = context,
            memoryManager = memoryManager,
            onSpeechStarted = {
                setAssistantState(AssistantState.SPEAKING)
            },
            onSpeechCompleted = {
                setAssistantState(AssistantState.IDLE)
            }
        )

        speechManager = SpeechManager(
            context = context,
            memoryManager = memoryManager,
            onReady = {
                setAssistantState(AssistantState.LISTENING)
                tvStatus?.text = context.getString(R.string.status_listening)
            },
            onPartialText = { partial ->
                tvQuery?.text = partial
            },
            onFinalText = { query ->
                handleUserQuery(query)
            },
            onRmsChanged = { rms ->
                val norm = ((rms + 2f) / 12f).coerceIn(0f, 1f)
                orbView?.setAudioAmplitude(norm)
                borderView?.setAudioAmplitude(norm)
            },
            onError = { error ->
                tvStatus?.text = error
                setAssistantState(AssistantState.IDLE)
            }
        )
    }

    override fun onShow(args: Bundle?, showFlags: Int) {
        super.onShow(args, showFlags)
        setAssistantState(AssistantState.LISTENING)
        tvStatus?.text = context.getString(R.string.status_listening)
        tvQuery?.text = "Listening for your command..."
        tvResponse?.text = ""

        speechManager?.startListening()
    }

    private fun handleUserQuery(query: String) {
        if (query.isBlank()) {
            setAssistantState(AssistantState.IDLE)
            return
        }

        tvQuery?.text = query
        setAssistantState(AssistantState.THINKING)
        tvStatus?.text = context.getString(R.string.status_thinking)

        sessionScope.launch {
            // Check local commands first
            val localResult = commandManager.parseAndExecute(query)
            val reply = if (localResult != null) {
                localResult.spokenResponse
            } else {
                aiManager.queryAssistant(query)
            }

            memoryManager.addMessage("user", query)
            memoryManager.addMessage("assistant", reply)

            withContext(Dispatchers.Main) {
                tvResponse?.text = reply
                tvStatus?.text = context.getString(R.string.status_speaking)
                setAssistantState(AssistantState.SPEAKING)
                ttsManager?.speak(reply)
            }
        }
    }

    private fun setAssistantState(state: AssistantState) {
        orbView?.assistantState = state
        borderView?.assistantState = state
    }

    override fun onHide() {
        speechManager?.stopListening()
        ttsManager?.stop()
        super.onHide()
    }

    override fun onDestroy() {
        speechManager?.destroy()
        ttsManager?.shutdown()
        super.onDestroy()
    }
}
