package com.sambhavai.assistant

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.sambhavai.assistant.databinding.ActivityMainBinding
import com.sambhavai.assistant.ui.AnimationController
import com.sambhavai.assistant.ui.AssistantState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_TRIGGERED_BY_WAKE_WORD = "extra_triggered_by_wake_word"
    }

    private lateinit var binding: ActivityMainBinding
    private lateinit var memoryManager: MemoryManager
    private lateinit var phoneActions: PhoneActions
    private lateinit var commandManager: CommandManager
    private lateinit var aiManager: AIManager
    private lateinit var animationController: AnimationController

    private var speechManager: SpeechManager? = null
    private var ttsManager: TtsManager? = null
    private var isWaitingForUserCommand = false

    private val wakeWordReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == WakeWordService.BROADCAST_WAKE_DETECTED) {
                handleWakeWordWakeUp()
            }
        }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] == true
        if (recordAudioGranted) {
            initVoiceEngines()
            if (memoryManager.isWakeWordEnabled) {
                WakeWordService.startService(this)
            }
        } else {
            Toast.makeText(this, R.string.error_permission_mic, Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        memoryManager = MemoryManager(this)
        phoneActions = PhoneActions(this)
        commandManager = CommandManager(phoneActions)
        aiManager = AIManager(this, memoryManager)

        animationController = AnimationController(
            orbView = binding.assistantOrbView,
            borderView = binding.glowingBorderView
        )

        setupUI()
        checkAndRequestPermissions()

        if (intent?.getBooleanExtra(EXTRA_TRIGGERED_BY_WAKE_WORD, false) == true) {
            handleWakeWordWakeUp()
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent?.getBooleanExtra(EXTRA_TRIGGERED_BY_WAKE_WORD, false) == true) {
            handleWakeWordWakeUp()
        }
    }

    private fun setupUI() {
        // Settings Button
        binding.btnSettings.setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }

        // Set as Default Digital Assistant
        binding.btnSetDefault.setOnClickListener {
            try {
                startActivity(Intent(Settings.ACTION_VOICE_INPUT_SETTINGS))
            } catch (e: Exception) {
                try {
                    startActivity(Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS))
                } catch (ex: Exception) {
                    Toast.makeText(this, "Go to Settings > Apps > Default Apps > Assist", Toast.LENGTH_LONG).show()
                }
            }
        }

        // Mic FAB
        binding.fabMic.setOnClickListener {
            if (binding.assistantOrbView.assistantState == AssistantState.LISTENING) {
                speechManager?.stopListening()
                setState(AssistantState.IDLE)
            } else {
                startListeningForCommand()
            }
        }

        updateWakeWordBadge()
    }

    private fun updateWakeWordBadge() {
        if (memoryManager.isWakeWordEnabled) {
            binding.tvWakeWordBadge.text = "Wake Word: \"Sam\" • Active"
            binding.tvWakeWordBadge.setTextColor(ContextCompat.getColor(this, R.color.cyan_glow))
        } else {
            binding.tvWakeWordBadge.text = "Wake Word: Disabled"
            binding.tvWakeWordBadge.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
        }
    }

    private fun checkAndRequestPermissions() {
        val permissionsToRequest = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = permissionsToRequest.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        } else {
            initVoiceEngines()
            if (memoryManager.isWakeWordEnabled) {
                WakeWordService.startService(this)
            }
        }
    }

    private fun initVoiceEngines() {
        ttsManager = TtsManager(
            context = this,
            memoryManager = memoryManager,
            onSpeechStarted = {
                setState(AssistantState.SPEAKING)
            },
            onSpeechCompleted = {
                if (isWaitingForUserCommand) {
                    isWaitingForUserCommand = false
                    startListeningForCommand()
                } else {
                    setState(AssistantState.IDLE)
                    // Resume wake word background service
                    val resumeIntent = Intent(this, WakeWordService::class.java).apply {
                        action = WakeWordService.ACTION_RESUME
                    }
                    startService(resumeIntent)
                }
            }
        )

        speechManager = SpeechManager(
            context = this,
            memoryManager = memoryManager,
            onReady = {
                setState(AssistantState.LISTENING)
                binding.tvAssistantStatus.text = getString(R.string.status_listening)
            },
            onPartialText = { partial ->
                binding.tvQueryPreview.text = partial
            },
            onFinalText = { query ->
                handleUserQuery(query)
            },
            onRmsChanged = { rms ->
                animationController.setAudioLevel(rms)
            },
            onError = { error ->
                binding.tvAssistantStatus.text = error
                setState(AssistantState.IDLE)
            }
        )
    }

    /**
     * Woken up by wake word "Sam":
     * Responds "Yes, I'm listening." then starts listening for user command.
     */
    private fun handleWakeWordWakeUp() {
        binding.tvQueryPreview.text = "\"Sam\""
        binding.tvResponsePreview.text = getString(R.string.sam_wake_response)
        binding.tvAssistantStatus.text = getString(R.string.status_speaking)
        setState(AssistantState.SPEAKING)

        isWaitingForUserCommand = true
        ttsManager?.speak(getString(R.string.sam_wake_response), "WAKE_CONFIRMATION")
    }

    private fun startListeningForCommand() {
        ttsManager?.stop()
        setState(AssistantState.LISTENING)
        binding.tvAssistantStatus.text = getString(R.string.status_listening)
        binding.tvQueryPreview.text = "Listening..."
        speechManager?.startListening()
    }

    private fun handleUserQuery(query: String) {
        if (query.isBlank()) {
            setState(AssistantState.IDLE)
            return
        }

        binding.tvQueryPreview.text = query
        setState(AssistantState.THINKING)
        binding.tvAssistantStatus.text = getString(R.string.status_thinking)

        lifecycleScope.launch {
            // 1. Try local device command first (e.g. YouTube, flashlight, volume, alarm, call)
            val localResult = commandManager.parseAndExecute(query)
            val reply = if (localResult != null) {
                localResult.spokenResponse
            } else {
                // 2. Delegate to Gemini AI Brain proxy
                aiManager.queryAssistant(query)
            }

            memoryManager.addMessage("user", query)
            memoryManager.addMessage("assistant", reply)

            withContext(Dispatchers.Main) {
                binding.tvResponsePreview.text = reply
                binding.tvAssistantStatus.text = getString(R.string.status_speaking)
                setState(AssistantState.SPEAKING)
                ttsManager?.speak(reply)
            }
        }
    }

    private fun setState(state: AssistantState) {
        animationController.setState(state)
        when (state) {
            AssistantState.IDLE -> {
                binding.tvAssistantStatus.text = getString(R.string.status_idle)
            }
            AssistantState.LISTENING -> {
                binding.tvAssistantStatus.text = getString(R.string.status_listening)
            }
            AssistantState.THINKING -> {
                binding.tvAssistantStatus.text = getString(R.string.status_thinking)
            }
            AssistantState.SPEAKING -> {
                binding.tvAssistantStatus.text = getString(R.string.status_speaking)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        updateWakeWordBadge()
        val filter = IntentFilter(WakeWordService.BROADCAST_WAKE_DETECTED)
        ContextCompat.registerReceiver(
            this,
            wakeWordReceiver,
            filter,
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
    }

    override fun onPause() {
        super.onPause()
        try {
            unregisterReceiver(wakeWordReceiver)
        } catch (e: Exception) {
            // Ignored
        }
    }

    override fun onDestroy() {
        speechManager?.destroy()
        ttsManager?.shutdown()
        super.onDestroy()
    }
}
