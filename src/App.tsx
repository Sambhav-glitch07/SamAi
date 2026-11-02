import React, { useState } from "react";
import {
  Smartphone,
  Code2,
  BookOpen,
  Download,
  Sparkles,
  Flame,
  CheckCircle2,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";
import { PhoneSimulator } from "./components/PhoneSimulator";
import { CodeExplorer } from "./components/CodeExplorer";
import { DeploymentGuide } from "./components/DeploymentGuide";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "guide">("simulator");

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Futuristic Navbar */}
      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-[#050814]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#070B1E] rounded-[15px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-white text-base">
                  S
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-wider text-white">
                  SAMBHAV<span className="text-cyan-400">AI</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-medium">
                  Assistant: &quot;Sam&quot;
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Native Android Personal Voice Assistant • Android 11 / Galaxy M30s
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "simulator"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Live Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "code"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">Android Codebase</span>
            </button>

            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "guide"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Setup &amp; Deployment</span>
            </button>

            {/* Quick Download Button */}
            <a
              href="/api/download/sambhavai-zip"
              download="SambhavAI-Android-Project.zip"
              className="ml-1 sm:ml-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              title="Download entire ready-to-build Android repository as ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "simulator" && <PhoneSimulator />}
        {activeTab === "code" && <CodeExplorer />}
        {activeTab === "guide" && <DeploymentGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#03050c] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>SambhavAI • Native Android Personal Assistant</span>
            <span className="text-slate-600">•</span>
            <span>Package: <code className="text-cyan-300">com.sambhavai.assistant</code></span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>VoiceInteractionService Ready</span>
            <span>•</span>
            <span>GitHub Actions CI/CD</span>
            <span>•</span>
            <span>Gemini AI Brain Proxy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
