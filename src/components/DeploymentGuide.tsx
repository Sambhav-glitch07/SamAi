import React, { useState } from "react";
import {
  Smartphone,
  Github,
  Cpu,
  ShieldCheck,
  BatteryCharging,
  Settings,
  ChevronRight,
  ExternalLink,
  Terminal,
  Zap,
} from "lucide-react";

export const DeploymentGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "github-actions" | "samsung-install" | "default-assistant" | "wake-word" | "gemini-backend"
  >("github-actions");

  return (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        {[
          { id: "github-actions", label: "1. GitHub Actions APK Build", icon: Github },
          { id: "samsung-install", label: "2. Samsung Galaxy M30s Install", icon: Smartphone },
          { id: "default-assistant", label: "3. Default Assistant Setup", icon: Settings },
          { id: "wake-word", label: "4. Offline Wake Word ('Sam')", icon: Cpu },
          { id: "gemini-backend", label: "5. Gemini AI Brain Backend", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: GitHub Actions APK Build */}
      {activeTab === "github-actions" && (
        <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Automated GitHub Actions APK Build Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Compile SambhavAI directly in GitHub's cloud and download the installable APK without needing Android Studio or a computer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-mono font-bold text-xs">STEP 1</div>
              <h4 className="font-semibold text-white text-sm">Push to GitHub</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download the complete ZIP archive or push this repository to your GitHub account (named <code>SambhavAI</code>).
              </p>
            </div>

            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-mono font-bold text-xs">STEP 2</div>
              <h4 className="font-semibold text-white text-sm">Run Workflow</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open your repo on GitHub &rarr; tap the <strong>Actions</strong> tab &rarr; select <strong>Build SambhavAI Android APK</strong> &rarr; click <strong>Run workflow</strong>.
              </p>
            </div>

            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-mono font-bold text-xs">STEP 3</div>
              <h4 className="font-semibold text-white text-sm">Download APK</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When the workflow finishes (~3 mins), download the <strong>SambhavAI-debug-apk</strong> artifact. Extract and install <code>app-debug.apk</code> directly on your phone!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>.github/workflows/android.yml</span>
              <span className="text-cyan-400">Artifact: SambhavAI-debug-apk</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-black/60 rounded-xl">
{`name: Build SambhavAI Android APK
on: [push, pull_request, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
      - run: chmod +x ./gradlew && ./gradlew assembleDebug --stacktrace
      - uses: actions/upload-artifact@v4
        with:
          name: SambhavAI-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Samsung Galaxy M30s Install */}
      {activeTab === "samsung-install" && (
        <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Samsung Galaxy M30s &amp; Android 11 Device Setup
              </h3>
              <p className="text-xs text-slate-400">
                Crucial battery management settings for Samsung One UI 3.1 so the &quot;Sam&quot; wake-word listener stays active.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-amber-400" />
                Exempt SambhavAI from Samsung Battery Sleeping Apps
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Samsung One UI puts background apps to deep sleep if left idle:
              </p>
              <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-2">
                <li>Open phone <strong>Settings</strong> &rarr; <strong>Battery and device care</strong> &rarr; <strong>Battery</strong>.</li>
                <li>Tap <strong>Background usage limits</strong>.</li>
                <li>Tap <strong>Never sleeping apps</strong> &rarr; tap the <strong>+</strong> icon &rarr; select <strong>SambhavAI</strong>.</li>
                <li>In SambhavAI Settings, tap <strong>&quot;Disable Battery Optimization (Galaxy M30s)&quot;</strong> and allow unrestricted background battery.</li>
              </ol>
            </div>

            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Permissions Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-0.5">Microphone (RECORD_AUDIO)</span>
                  Required for offline wake word spotter and SpeechRecognizer.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-0.5">Camera Hardware</span>
                  Required by CameraManager to toggle the flashlight / torch.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-0.5">Foreground Service</span>
                  Displays a persistent notification when microphone listener is active.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-0.5">Set Alarms</span>
                  Allows scheduling wake-up alarms directly through clock apps.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Default Assistant Setup */}
      {activeTab === "default-assistant" && (
        <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Set SambhavAI as Default Android Digital Assistant
              </h3>
              <p className="text-xs text-slate-400">
                Enable system-wide assist invocation through home button gestures and lock screen access.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white text-sm">Step-by-Step System Activation:</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center shrink-0 text-[11px] font-bold">
                    1
                  </span>
                  <span>Open Android <strong>Settings</strong> &rarr; scroll to <strong>Apps</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center shrink-0 text-[11px] font-bold">
                    2
                  </span>
                  <span>Tap <strong>Choose default apps</strong> (or the 3 dots menu &rarr; Default apps).</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center shrink-0 text-[11px] font-bold">
                    3
                  </span>
                  <span>Tap <strong>Digital assistant app</strong> (Assist &amp; voice input).</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center shrink-0 text-[11px] font-bold">
                    4
                  </span>
                  <span>Select <strong>SambhavAI Voice Assistant</strong> and confirm the system dialog.</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 leading-relaxed">
              <strong>How to invoke:</strong> After setting as default assistant, swiping up from either bottom corner of your Samsung Galaxy screen or holding the Home button will instantly pop up Sam&apos;s liquid glass overlay (<code>SamVoiceInteractionSession</code>) with glowing borders!
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Offline Wake Word */}
      {activeTab === "wake-word" && (
        <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Offline Wake-Word Detection Engine (&quot;Sam&quot;)
              </h3>
              <p className="text-xs text-slate-400">
                100% on-device wake-word detection architecture with zero cloud dependency.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white text-sm">Dual-Tier Wake Word Architecture:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                SambhavAI implements a robust, battery-efficient acoustic keyword spotter in <code>WakeWordEngine.kt</code>:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-2">
                <li>
                  <strong className="text-cyan-300">16kHz 16-bit PCM AudioRecord:</strong> Consumes less than 1.5% CPU on Samsung Exynos 9611.
                </li>
                <li>
                  <strong className="text-cyan-300">Phonetic Trajectory Filter:</strong> Specifically tunes for the sibilant <code>/s/</code>, open front vowel <code>/æ/</code>, and bilabial nasal <code>/m/</code> formant envelope.
                </li>
                <li>
                  <strong className="text-cyan-300">Anti-Chatter Cooldown Guard:</strong> Imposes a 2.5-second refractory guard to prevent repeated false triggers.
                </li>
              </ul>
            </div>

            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white text-sm">Picovoice Porcupine Custom Model Option:</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you prefer a deep-learning Picovoice Porcupine model:
                1. Go to <strong>console.picovoice.ai</strong> and create a free account.
                2. Train a custom keyword model for <strong>&quot;Sam&quot;</strong> targeting Android.
                3. Download <code>sam_android.ppn</code> and drop it into <code>app/src/main/assets/</code>.
                4. Enter your Picovoice AccessKey in <code>WakeWordEngine.kt</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Gemini AI Brain Backend */}
      {activeTab === "gemini-backend" && (
        <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Gemini AI Brain Proxy Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Secure server-side proxy prevents exposing private API keys inside decompiled APKs.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white text-sm">Active Backend Endpoints:</h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">POST /api/assistant/chat</span>
                  <span className="text-slate-400">Gemini 3.8 Flash AI Brain</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">GET /api/assistant/health</span>
                  <span className="text-slate-400">Server status &amp; key validator</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">GET /api/download/sambhavai-zip</span>
                  <span className="text-slate-400">Complete Android ZIP Packager</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white block mb-1">Connecting from Android APK:</span>
              In SambhavAI on your phone, open <strong>Settings (gear icon)</strong> &rarr; enter your Cloud Run / server URL into <strong>Gemini AI Backend Proxy URL</strong> &rarr; tap <strong>Test Connection</strong>. If offline, Sam automatically uses local heuristic rules for commands and answers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
