package com.sambhavai.assistant

import java.util.Locale
import java.util.regex.Pattern

data class CommandResult(
    val handled: Boolean,
    val spokenResponse: String,
    val actionType: String? = null
)

class CommandManager(private val phoneActions: PhoneActions) {

    fun parseAndExecute(rawCommand: String): CommandResult? {
        val query = rawCommand.trim().lowercase(Locale.ROOT)

        // 1. Flashlight
        if (query.contains("turn on flashlight") || query.contains("flashlight on") || query.contains("torch on")) {
            val res = phoneActions.setFlashlight(true)
            return CommandResult(true, res.second, "FLASHLIGHT_ON")
        }
        if (query.contains("turn off flashlight") || query.contains("flashlight off") || query.contains("torch off")) {
            val res = phoneActions.setFlashlight(false)
            return CommandResult(true, res.second, "FLASHLIGHT_OFF")
        }

        // 2. Apps: YouTube, WhatsApp, Chrome
        if (query.contains("open youtube") || query.contains("launch youtube")) {
            val res = phoneActions.openApp(PhoneActions.PKG_YOUTUBE, "YouTube")
            return CommandResult(true, res.second, "OPEN_YOUTUBE")
        }
        if (query.contains("open whatsapp") || query.contains("launch whatsapp")) {
            val res = phoneActions.openApp(PhoneActions.PKG_WHATSAPP, "WhatsApp")
            return CommandResult(true, res.second, "OPEN_WHATSAPP")
        }
        if (query.contains("open chrome") || query.contains("launch chrome") || query.contains("open browser")) {
            val res = phoneActions.openApp(PhoneActions.PKG_CHROME, "Google Chrome")
            return CommandResult(true, res.second, "OPEN_CHROME")
        }

        // 3. Time and Date
        if (query.contains("what time is it") || query.contains("current time") || query.contains("tell me the time") || query == "time") {
            val time = phoneActions.getCurrentTime()
            return CommandResult(true, "It's $time.", "GET_TIME")
        }
        if (query.contains("what is today's date") || query.contains("what's the date") || query.contains("today's date")) {
            val date = phoneActions.getCurrentDate()
            return CommandResult(true, "Today is $date.", "GET_DATE")
        }

        // 4. Volume
        if (query.contains("increase volume") || query.contains("volume up") || query.contains("louder")) {
            val res = phoneActions.adjustVolume(true)
            return CommandResult(true, res.second, "VOLUME_UP")
        }
        if (query.contains("decrease volume") || query.contains("volume down") || query.contains("lower volume")) {
            val res = phoneActions.adjustVolume(false)
            return CommandResult(true, res.second, "VOLUME_DOWN")
        }

        // 5. System Settings
        if (query.contains("open settings") || query.contains("launch settings") || query == "settings") {
            val res = phoneActions.openSettings()
            return CommandResult(true, res.second, "OPEN_SETTINGS")
        }

        // 6. Alarm: "Set an alarm for 6 AM", "set alarm for 7:30", etc.
        val alarmPattern = Pattern.compile("set (?:an )?alarm for (\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?", Pattern.CASE_INSENSITIVE)
        val alarmMatcher = alarmPattern.matcher(query)
        if (alarmMatcher.find()) {
            var hour = alarmMatcher.group(1)?.toIntOrNull() ?: 7
            val minute = alarmMatcher.group(2)?.toIntOrNull() ?: 0
            val ampm = alarmMatcher.group(3)?.lowercase(Locale.ROOT)

            if (ampm == "pm" && hour < 12) hour += 12
            if (ampm == "am" && hour == 12) hour = 0

            val res = phoneActions.setAlarm(hour, minute)
            return CommandResult(true, res.second, "SET_ALARM")
        }

        // 7. Phone call: "Call Mom", "Call 9876543210"
        val callPattern = Pattern.compile("call\\s+([a-zA-Z0-9 ]+)", Pattern.CASE_INSENSITIVE)
        val callMatcher = callPattern.matcher(query)
        if (callMatcher.find()) {
            val target = callMatcher.group(1)?.trim() ?: ""
            if (target.isNotEmpty()) {
                val res = phoneActions.initiateCall(target)
                return CommandResult(true, res.second, "CALL")
            }
        }

        // Not a direct local command -> delegate to Gemini AI Brain
        return null
    }
}
