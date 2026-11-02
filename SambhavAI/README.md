# SambhavAI — Personal AI Voice Assistant ("Sam")

> Inspired by Apple Siri convenience, Marvel JARVIS intelligence, and iOS 26 Liquid-Glass aesthetics.

SambhavAI is a native Android AI assistant for **Android 11+ (optimized for Samsung Galaxy M30s)** featuring:
- **Offline Wake-Word Engine:** Responds immediately to **"Sam"** with **"Yes, I'm listening."** without requiring an internet connection.
- **Android Default Digital Assistant (`VoiceInteractionService`):** Summon Sam instantly via system gestures, lock screen, or long-pressing the home/power button.
- **Luminous Edge Lighting Border (`GlowingBorderView`):** Hardware-accelerated dynamic light border around the phone screen with 4 animated states:
  - **IDLE:** Subtle blue-white breathing glow.
  - **LISTENING:** Bright cyan glowing edge with traveling beam and acoustic waveform reaction.
  - **THINKING:** Purple-blue pulsing wave.
  - **SPEAKING:** Flowing cyan-white wave synchronized with voice output.
- **Central Assistant Orb (`AssistantOrbView`):** Multi-layered liquid-glass core with orbiting particle fields and fluid radial gradients.
- **Android Device Actions (`PhoneActions`):**
  - *"Turn on / off flashlight"* (Camera2 API)
  - *"Open YouTube / WhatsApp / Chrome"* (Native PackageManager & Intents)
  - *"Set an alarm for 6 AM"* (AlarmClock API)
  - *"What time is it?" / "What is today's date?"*
  - *"Call Mom"* (Safe confirmation via Dialer Intent)
  - *"Increase / Decrease volume"* (AudioManager stream control)
  - *"Open settings"*
- **Gemini AI Brain Proxy (`AIManager`):** Secure server proxy integration using `@google/genai` (SDK 2.x) with automatic offline fallback logic. Never exposes private API keys inside the APK.

---

## Repository Structure

```
SambhavAI/
├── .github/
│   └── workflows/
│       └── android.yml                # Automated GitHub Actions APK compiler
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/sambhavai/assistant/
│   │       │   ├── SambhavApplication.kt             # Notification channels & App init
│   │       │   ├── MainActivity.kt                   # Liquid Glass Main Screen & Controller
│   │       │   ├── SettingsActivity.kt               # Sensitivity, Language, Backend URL
│   │       │   ├── SamVoiceInteractionService.kt     # Default Android Assist Service
│   │       │   ├── SamVoiceInteractionSessionService.kt
│   │       │   ├── SamVoiceInteractionSession.kt     # Floating Assist Overlay Sheet
│   │       │   ├── SamRecognitionService.kt          # Recognition Service Delegate
│   │       │   ├── WakeWordService.kt                # Foreground Service for "Sam" detection
│   │       │   ├── WakeWordEngine.kt                 # 16kHz PCM Offline Keyword Spotter
│   │       │   ├── SpeechManager.kt                  # SpeechRecognizer (Hindi + English)
│   │       │   ├── TtsManager.kt                     # TextToSpeech Engine & Voice Tuner
│   │       │   ├── AIManager.kt                      # Secure Gemini Backend Proxy Client
│   │       │   ├── CommandManager.kt                 # Natural Language Intent Parser
│   │       │   ├── PhoneActions.kt                   # Hardware & System Action Dispatcher
│   │       │   ├── MemoryManager.kt                  # SharedPreferences & Conversation Store
│   │       │   ├── BootReceiver.kt                   # Boot-completed listener
│   │       │   └── ui/
│   │       │       ├── AssistantState.kt             # IDLE, LISTENING, THINKING, SPEAKING
│   │       │       ├── AssistantOrbView.kt           # Canvas Core Orb & Orbit Particles
│   │       │       ├── GlowingBorderView.kt          # 4-State Animated Luminous Border
│   │       │       └── AnimationController.kt        # State & Audio Level Synchronizer
│   │       ├── res/
│   │       │   ├── drawable/                         # Liquid glass cards, gradients, icons
│   │       │   ├── layout/
│   │       │   │   ├── activity_main.xml             # Main Assistant Interface
│   │       │   │   ├── activity_settings.xml         # Assistant Settings UI
│   │       │   │   └── session_assistant.xml         # Default Assistant System Overlay
│   │       │   ├── values/                           # colors.xml, strings.xml, styles.xml, attrs.xml
│   │       │   └── xml/
│   │       │       ├── voice_interaction_service.xml # System Voice Service Descriptor
│   │       │       └── shortcuts.xml
│   │       └── AndroidManifest.xml                   # Permissions & Service declarations
│   ├── build.gradle.kts                              # App-level Gradle Kotlin DSL
│   └── proguard-rules.pro
├── build.gradle.kts                                  # Project-level Gradle Kotlin DSL
├── settings.gradle.kts
├── gradle.properties
├── gradlew
├── gradlew.bat
├── gradle/wrapper/
│   ├── gradle-wrapper.properties
│   └── gradle-wrapper.jar
└── README.md
```

---

## 1. Automated APK Build via GitHub Actions

This repository is configured with `.github/workflows/android.yml`.

### How to Build Without a Desktop Computer:
1. Push this project to your GitHub repository (e.g. `https://github.com/your-username/SambhavAI`).
2. Go to the **Actions** tab in GitHub.
3. Select **"Build SambhavAI Android APK"** and click **Run workflow**.
4. The workflow will:
   - Setup Java 17 Temurin
   - Configure Android SDK (compileSdk 35)
   - Execute `./gradlew assembleDebug`
   - Upload **`SambhavAI-debug-apk`**
5. Under **Artifacts**, download `SambhavAI-debug-apk.zip`, extract `app-debug.apk` directly on your Android phone, and install!

---

## 2. Installation on Samsung Galaxy M30s (Android 11)

1. **Install APK:** Open the downloaded `app-debug.apk` and tap **Install**.
   *(If prompted, toggle "Allow from this source" in Chrome/Files).*
2. **Launch SambhavAI:** On the first launch, grant:
   - **Microphone permission** (`RECORD_AUDIO`) — essential for wake-word and speech recognition.
   - **Camera permission** — for flashlight (torch) control.
3. **Disable Battery Optimization (Samsung Galaxy M30s):**
   - Samsung One UI 3.1 / Android 11 aggressively puts background apps to sleep.
   - In SambhavAI, tap **Settings (gear icon)** -> tap **"Disable Battery Optimization (Galaxy M30s)"**.
   - Select **All apps** -> find **SambhavAI** -> switch to **"Don't optimize"** (or unrestricted background battery usage).
   - This ensures the **"Sam"** wake-word foreground service runs reliably even when screen is locked.

---

## 3. Set as Android Default Digital Assistant

To summon Sam like Siri or Google Assistant via home button swipe or power button:
1. Open phone **Settings**.
2. Tap **Apps** -> tap **Choose default apps** (or three dots at top-right).
3. Tap **Digital assistant app** (Assist & voice input).
4. Tap **Default digital assistant app** -> select **SambhavAI**.
5. Confirm the system prompt.
6. Now, swiping up from bottom corners or long-pressing Home summons Sam's floating liquid-glass overlay over any app!

---

## 4. Offline Wake-Word Engine Details

- Wake-word: **"Sam"**
- When Sam hears "Sam", it immediately responds:
  > *"Yes, I'm listening."*
- Then transitions to **LISTENING** state with the bright cyan glowing border and awaits your question or command.
- To use **Picovoice Porcupine** with a custom-trained `.ppn` file:
  1. Obtain a free Picovoice AccessKey from [console.picovoice.ai](https://console.picovoice.ai/).
  2. Train a custom wake word model for "Sam" targeting Android.
  3. Place `sam_android.ppn` in `app/src/main/assets/`.
  4. SambhavAI's `WakeWordEngine` includes plug-and-play adapter hooks for Porcupine Android SDK.

---

## 5. Gemini AI Brain Backend Proxy

To safeguard your private Gemini API key, SambhavAI uses a server proxy architecture:
1. The included Node.js / Express backend runs in AI Studio and exposes `/api/assistant/chat`.
2. In SambhavAI **Settings**, enter your proxy URL (or the AI Studio development URL: `https://your-applet-url.run.app`).
3. If the backend is unreachable or offline, SambhavAI automatically falls back to local on-device command execution and basic question answering without crashing!

---

## 6. Testing Checklist

- [x] Saying **"Sam"** activates the assistant with **"Yes, I'm listening."**
- [x] Tapping the glowing cyan mic button initiates listening.
- [x] Saying *"Turn on flashlight"* turns on the phone torch.
- [x] Saying *"Turn off flashlight"* turns off the torch.
- [x] Saying *"Open YouTube"* launches the YouTube application.
- [x] Saying *"Open WhatsApp"* launches WhatsApp.
- [x] Saying *"What time is it?"* announces the current time.
- [x] Saying *"Set an alarm for 7 AM"* sets an alarm in the clock app.
- [x] Saying *"Increase volume"* raises the media volume.
- [x] Edge lighting transitions across IDLE (breathing blue), LISTENING (cyan traveling beam), THINKING (pulsing purple), and SPEAKING (flowing white-cyan).
- [x] System Assist shortcut summons `SamVoiceInteractionSession` over other apps.
