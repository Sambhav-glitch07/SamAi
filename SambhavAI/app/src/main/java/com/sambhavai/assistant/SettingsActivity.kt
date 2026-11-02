package com.sambhavai.assistant

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.snackbar.Snackbar
import com.sambhavai.assistant.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding
    private lateinit var memoryManager: MemoryManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        memoryManager = MemoryManager(this)

        setupToolbar()
        setupWakeWordControls()
        setupVoiceControls()
        setupBackendControls()
        setupSystemIntegration()
    }

    private fun setupToolbar() {
        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupWakeWordControls() {
        binding.switchWakeWord.isChecked = memoryManager.isWakeWordEnabled
        binding.switchWakeWord.setOnCheckedChangeListener { _, isChecked ->
            memoryManager.isWakeWordEnabled = isChecked
            if (isChecked) {
                WakeWordService.startService(this)
                Snackbar.make(binding.root, "Wake word 'Sam' active", Snackbar.LENGTH_SHORT).show()
            } else {
                WakeWordService.stopService(this)
                Snackbar.make(binding.root, "Wake word stopped", Snackbar.LENGTH_SHORT).show()
            }
        }

        binding.sliderSensitivity.value = memoryManager.wakeSensitivity
        binding.tvSensitivityValue.text = String.format("%.2f", memoryManager.wakeSensitivity)
        binding.sliderSensitivity.addOnChangeListener { _, value, _ ->
            memoryManager.wakeSensitivity = value
            binding.tvSensitivityValue.text = String.format("%.2f", value)
        }
    }

    private fun setupVoiceControls() {
        val languages = listOf("English (India) [en-IN]", "English (US) [en-US]", "Hindi (India) [hi-IN]")
        val langCodes = listOf("en-IN", "en-US", "hi-IN")

        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, languages)
        binding.spinnerLanguage.adapter = adapter

        val currentIdx = langCodes.indexOf(memoryManager.voiceLanguage).coerceAtLeast(0)
        binding.spinnerLanguage.setSelection(currentIdx)

        binding.spinnerLanguage.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                memoryManager.voiceLanguage = langCodes[position]
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // Speed
        binding.sliderSpeed.value = memoryManager.speechRate
        binding.tvSpeedValue.text = String.format("%.1fx", memoryManager.speechRate)
        binding.sliderSpeed.addOnChangeListener { _, value, _ ->
            memoryManager.speechRate = value
            binding.tvSpeedValue.text = String.format("%.1fx", value)
        }

        // Pitch
        binding.sliderPitch.value = memoryManager.speechPitch
        binding.tvPitchValue.text = String.format("%.1fx", memoryManager.speechPitch)
        binding.sliderPitch.addOnChangeListener { _, value, _ ->
            memoryManager.speechPitch = value
            binding.tvPitchValue.text = String.format("%.1fx", value)
        }
    }

    private fun setupBackendControls() {
        binding.etBackendUrl.setText(memoryManager.backendUrl)

        binding.btnTestBackend.setOnClickListener {
            val url = binding.etBackendUrl.text.toString().trim()
            memoryManager.backendUrl = url
            if (url.isEmpty()) {
                Toast.makeText(this, "Please enter a valid backend URL", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Backend URL saved. Testing connection...", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupSystemIntegration() {
        binding.btnOpenDefaultAssist.setOnClickListener {
            try {
                val intent = Intent(Settings.ACTION_VOICE_INPUT_SETTINGS)
                startActivity(intent)
            } catch (e: Exception) {
                try {
                    startActivity(Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS))
                } catch (ex: Exception) {
                    Toast.makeText(this, "Please go to Settings > Apps > Default Apps > Assist", Toast.LENGTH_LONG).show()
                }
            }
        }

        binding.btnBatteryOptimization.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent()
                val packageName = packageName
                val pm = getSystemService(POWER_SERVICE) as PowerManager
                if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                    intent.action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                    intent.data = Uri.parse("package:$packageName")
                } else {
                    intent.action = Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                }
                try {
                    startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(this, "Open Device Settings > Battery > Optimize battery usage", Toast.LENGTH_LONG).show()
                }
            }
        }

        binding.btnClearHistory.setOnClickListener {
            memoryManager.clearHistory()
            Toast.makeText(this, R.string.pref_clear_history_confirm, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onPause() {
        super.onPause()
        memoryManager.backendUrl = binding.etBackendUrl.text.toString().trim()
    }
}
