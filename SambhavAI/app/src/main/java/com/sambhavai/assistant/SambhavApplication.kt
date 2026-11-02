package com.sambhavai.assistant

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class SambhavApplication : Application() {

    companion object {
        const val WAKE_CHANNEL_ID = "sambhav_wake_channel"
        const val ASSISTANT_CHANNEL_ID = "sambhav_assistant_channel"
        lateinit var instance: SambhavApplication
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            val wakeChannel = NotificationChannel(
                WAKE_CHANNEL_ID,
                "Wake Word Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps SambhavAI listening for the wake word \"Sam\" in the background"
                setShowBadge(false)
            }

            val assistantChannel = NotificationChannel(
                ASSISTANT_CHANNEL_ID,
                "Assistant Actions",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for assistant operations and alerts"
            }

            notificationManager?.createNotificationChannel(wakeChannel)
            notificationManager?.createNotificationChannel(assistantChannel)
        }
    }
}
