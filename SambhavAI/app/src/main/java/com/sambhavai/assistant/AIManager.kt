package com.sambhavai.assistant

import android.content.Context
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class AIManager(
    private val context: Context,
    private val memoryManager: MemoryManager
) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun queryAssistant(userMessage: String): String = withContext(Dispatchers.IO) {
        val configuredUrl = memoryManager.backendUrl.trim()

        if (configuredUrl.isNotEmpty()) {
            try {
                val fullUrl = if (configuredUrl.endsWith("/api/assistant/chat")) {
                    configuredUrl
                } else if (configuredUrl.endsWith("/")) {
                    "${configuredUrl}api/assistant/chat"
                } else {
                    "$configuredUrl/api/assistant/chat"
                }

                val payload = JsonObject().apply {
                    addProperty("message", userMessage)
                    addProperty("language", memoryManager.voiceLanguage)

                    // Include last 6 context messages
                    val history = memoryManager.getConversationHistory().takeLast(6)
                    add("history", gson.toJsonTree(history))
                }

                val request = Request.Builder()
                    .url(fullUrl)
                    .post(payload.toString().toRequestBody(jsonMediaType))
                    .addHeader("User-Agent", "SambhavAI-Android/1.0")
                    .build()

                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val bodyString = response.body?.string() ?: ""
                    val jsonObj = gson.fromJson(bodyString, JsonObject::class.java)
                    if (jsonObj.has("reply")) {
                        return@withContext jsonObj.get("reply").asString
                    }
                }
            } catch (e: Exception) {
                // Network or server issue -> fall back to local intelligent answers
            }
        }

        // Local Smart Offline Fallback Engine
        return@withContext generateLocalResponse(userMessage)
    }

    private fun generateLocalResponse(query: String): String {
        val q = query.trim().lowercase()

        // Math evaluation
        if (q.contains("+") || q.contains("-") || q.contains("*") || q.contains("/") || q.contains("times") || q.contains("plus") || q.contains("minus")) {
            val mathResult = tryEvaluateMath(q)
            if (mathResult != null) return "The result is $mathResult."
        }

        // Who are you / greetings
        if (q.contains("who are you") || q.contains("your name")) {
            return "I am Sam, your personal AI assistant inspired by JARVIS, running natively on your Android device."
        }
        if (q.contains("how are you")) {
            return "All systems operational and ready to assist you. How can I help today?"
        }
        if (q.contains("thank you") || q.contains("thanks")) {
            return "You're welcome! Let me know if you need anything else."
        }

        // General assistance hint
        return "I heard: \"$query\". To get full cloud reasoning with Gemini, verify your backend proxy URL in Settings. Local device actions like flashlight, apps, volume, and alarms are fully operational."
    }

    private fun tryEvaluateMath(expr: String): Double? {
        return try {
            val cleaned = expr.replace("what is", "").replace("calculate", "").trim()
            val tokens = cleaned.split("\\s+".toRegex())
            if (tokens.size >= 3) {
                val a = tokens[0].toDoubleOrNull()
                val op = tokens[1]
                val b = tokens[2].toDoubleOrNull()
                if (a != null && b != null) {
                    when (op) {
                        "+", "plus" -> a + b
                        "-", "minus" -> a - b
                        "*", "x", "times" -> a * b
                        "/", "divided by" -> if (b != 0.0) a / b else null
                        else -> null
                    }
                } else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
}
