package com.sambhavai.assistant

import android.app.SearchManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.provider.AlarmClock
import android.provider.Settings
import androidx.core.content.ContextCompat
import java.text.SimpleDateFormat
import java.util.*

class PhoneActions(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager

    companion object {
        const val PKG_YOUTUBE = "com.google.android.youtube"
        const val PKG_WHATSAPP = "com.whatsapp"
        const val PKG_CHROME = "com.android.chrome"
    }

    /**
     * Toggles flashlight using CameraManager
     */
    fun setFlashlight(enabled: Boolean): Pair<Boolean, String> {
        return try {
            if (cameraManager == null) {
                return Pair(false, "Camera manager not available on this device.")
            }
            val cameraId = cameraManager.cameraIdList.firstOrNull { id ->
                val chars = cameraManager.getCameraCharacteristics(id)
                chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
            }

            if (cameraId == null) {
                return Pair(false, "Flashlight hardware not found on device.")
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                cameraManager.setTorchMode(cameraId, enabled)
                val msg = if (enabled) "Flashlight turned on." else "Flashlight turned off."
                Pair(true, msg)
            } else {
                Pair(false, "Flashlight control requires Android 6.0+")
            }
        } catch (e: Exception) {
            Pair(false, "Could not control flashlight: ${e.message}")
        }
    }

    /**
     * Opens an application by package name or search intent
     */
    fun openApp(packageName: String, appDisplayName: String): Pair<Boolean, String> {
        return try {
            val pm = context.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                Pair(true, "Opening $appDisplayName.")
            } else {
                // Fallback to web or market intent
                val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                if (marketIntent.resolveActivity(pm) != null) {
                    context.startActivity(marketIntent)
                    Pair(true, "$appDisplayName is not installed. Opening Play Store.")
                } else {
                    Pair(false, "Application $appDisplayName is not installed.")
                }
            }
        } catch (e: Exception) {
            Pair(false, "Unable to launch $appDisplayName: ${e.message}")
        }
    }

    /**
     * Sets an alarm for given hour and minute (24h format)
     */
    fun setAlarm(hour: Int, minute: Int, message: String = "SambhavAI Alarm"): Pair<Boolean, String> {
        return try {
            val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_HOUR, hour)
                putExtra(AlarmClock.EXTRA_MINUTES, minute)
                putExtra(AlarmClock.EXTRA_MESSAGE, message)
                putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (intent.resolveActivity(context.packageManager) != null) {
                context.startActivity(intent)
                val formattedTime = String.format(Locale.getDefault(), "%02d:%02d", hour, minute)
                Pair(true, "Alarm scheduled for $formattedTime.")
            } else {
                Pair(false, "No clock or alarm application found.")
            }
        } catch (e: Exception) {
            Pair(false, "Could not set alarm: ${e.message}")
        }
    }

    /**
     * Adjusts system media volume
     */
    fun adjustVolume(increase: Boolean): Pair<Boolean, String> {
        return try {
            if (audioManager == null) {
                return Pair(false, "Audio manager not available.")
            }
            val direction = if (increase) AudioManager.ADJUST_RAISE else AudioManager.ADJUST_LOWER
            audioManager.adjustStreamVolume(
                AudioManager.STREAM_MUSIC,
                direction,
                AudioManager.FLAG_SHOW_UI
            )
            val msg = if (increase) "Volume increased." else "Volume decreased."
            Pair(true, msg)
        } catch (e: Exception) {
            Pair(false, "Unable to change volume: ${e.message}")
        }
    }

    /**
     * Initiates a phone call or dialer.
     * Note: Per privacy guidelines, sensitive actions require user confirmation via dialer
     * unless direct CALL_PHONE is granted.
     */
    fun initiateCall(phoneNumberOrName: String): Pair<Boolean, String> {
        return try {
            // Always prefer dialer for user confirmation and safety
            val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:${Uri.encode(phoneNumberOrName)}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(dialIntent)
            Pair(true, "Opening dialer for $phoneNumberOrName.")
        } catch (e: Exception) {
            Pair(false, "Could not open dialer: ${e.message}")
        }
    }

    /**
     * Opens system device settings
     */
    fun openSettings(): Pair<Boolean, String> {
        return try {
            val intent = Intent(Settings.ACTION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            Pair(true, "Opening Android Settings.")
        } catch (e: Exception) {
            Pair(false, "Failed to open settings: ${e.message}")
        }
    }

    /**
     * Returns current time and date
     */
    fun getCurrentTime(): String {
        val sdf = SimpleDateFormat("h:mm a", Locale.getDefault())
        return sdf.format(Date())
    }

    fun getCurrentDate(): String {
        val sdf = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault())
        return sdf.format(Date())
    }
}
