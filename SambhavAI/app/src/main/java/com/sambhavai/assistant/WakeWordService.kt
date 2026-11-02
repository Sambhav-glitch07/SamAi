package com.sambhavai.assistant

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class WakeWordService : Service() {

    companion object {
        const val ACTION_START = "com.sambhavai.assistant.action.START_WAKE_SERVICE"
        const val ACTION_STOP = "com.sambhavai.assistant.action.STOP_WAKE_SERVICE"
        const val ACTION_PAUSE = "com.sambhavai.assistant.action.PAUSE_WAKE_SERVICE"
        const val ACTION_RESUME = "com.sambhavai.assistant.action.RESUME_WAKE_SERVICE"

        const val BROADCAST_WAKE_DETECTED = "com.sambhavai.assistant.WAKE_WORD_DETECTED"
        private const val NOTIFICATION_ID = 1001

        fun startService(context: Context) {
            val intent = Intent(context, WakeWordService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, WakeWordService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    private var wakeWordEngine: WakeWordEngine? = null
    private lateinit var memoryManager: MemoryManager

    override fun onCreate() {
        super.onCreate()
        memoryManager = MemoryManager(this)

        wakeWordEngine = WakeWordEngine(this, memoryManager) {
            handleWakeWordTrigger()
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                wakeWordEngine?.stop()
                stopForeground(true)
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_PAUSE -> {
                wakeWordEngine?.pause()
            }
            ACTION_RESUME -> {
                wakeWordEngine?.resume()
            }
            else -> {
                startForegroundWithNotification()
                if (memoryManager.isWakeWordEnabled) {
                    wakeWordEngine?.start()
                }
            }
        }
        return START_STICKY
    }

    private fun startForegroundWithNotification() {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, SambhavApplication.WAKE_CHANNEL_ID)
            .setContentTitle(getString(R.string.wake_word_service_title))
            .setContentText(getString(R.string.wake_word_service_desc))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun handleWakeWordTrigger() {
        // Pause wake word engine while assistant handles conversation
        wakeWordEngine?.pause()

        // 1. Broadcast event
        val broadcastIntent = Intent(BROADCAST_WAKE_DETECTED)
        sendBroadcast(broadcastIntent)

        // 2. Bring MainActivity to foreground
        val activityIntent = Intent(this, MainActivity::class.java).apply {
            putExtra(MainActivity.EXTRA_TRIGGERED_BY_WAKE_WORD, true)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        startActivity(activityIntent)
    }

    override fun onDestroy() {
        wakeWordEngine?.stop()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
