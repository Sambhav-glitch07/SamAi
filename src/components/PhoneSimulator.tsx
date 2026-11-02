import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Flashlight,
  ExternalLink,
  Clock,
  PhoneCall,
  Sliders,
  Settings,
  Flame,
  CheckCircle2,
  Send,
} from "lucide-react";
import { AssistantState, ChatMessage } from "../types";

interface PhoneSimulatorProps {
  onBackendCall?: (message: string) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = () => {
  const [assistantState, setAssistantState] = useState<AssistantState>("IDLE");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content: "Hello! I'm Sam. How can I help you?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isMicListening, setIsMicListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [systemVolume, setSystemVolume] = useState(70);
  const [alarmScheduled, setAlarmScheduled] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [activeActionBanner, setActiveActionBanner] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const safeStartRecognition = () => {
    if (!speechSupported || !recognitionRef.current) {
      setAssistantState("LISTENING");
      return;
    }
    if (isListeningRef.current) {
      setAssistantState("LISTENING");
      return;
    }
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsMicListening(true);
      setAssistantState("LISTENING");
    } catch (err: any) {
      // InvalidStateError occurs when recognition is already started or starting
      if (err?.name === "InvalidStateError" || String(err?.message || "").includes("already started")) {
        isListeningRef.current = true;
        setIsMicListening(true);
        setAssistantState("LISTENING");
      } else {
        console.warn("SpeechRecognition start notice:", err);
        setAssistantState("LISTENING");
      }
    }
  };

  const safeStopRecognition = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignored
      }
    }
    isListeningRef.current = false;
    setIsMicListening(false);
  };

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsMicListening(true);
        setAssistantState("LISTENING");
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          setInputText(interimTranscript);
        }

        if (finalTranscript) {
          setInputText(finalTranscript);
          handleProcessCommand(finalTranscript);
        }
      };

      recognition.onerror = () => {
        isListeningRef.current = false;
        setIsMicListening(false);
        setAssistantState("IDLE");
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
    }

    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setTtsSupported(true);
    }

    return () => {
      safeStopRecognition();
      synthRef.current?.cancel();
    };
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, assistantState]);

  // Audio level simulation during LISTENING or SPEAKING
  useEffect(() => {
    let interval: any;
    if (assistantState === "LISTENING" || assistantState === "SPEAKING") {
      interval = setInterval(() => {
        setAudioLevel(0.3 + Math.random() * 0.7);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [assistantState]);

  // Canvas Orb Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulsePhase = 0;

    const render = () => {
      angle += 0.02;
      pulsePhase += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Colors based on assistant state
      let primary = "#2979FF";
      let secondary = "#00E5FF";
      let glow = "rgba(0, 229, 255, 0.4)";

      if (assistantState === "LISTENING") {
        primary = "#00E5FF";
        secondary = "#00B0FF";
        glow = "rgba(0, 229, 255, 0.7)";
      } else if (assistantState === "THINKING") {
        primary = "#7C4DFF";
        secondary = "#B388FF";
        glow = "rgba(124, 77, 255, 0.6)";
      } else if (assistantState === "SPEAKING") {
        primary = "#00E5FF";
        secondary = "#FFFFFF";
        glow = "rgba(224, 247, 250, 0.6)";
      }

      const baseRadius = 45;
      const radius =
        baseRadius + (assistantState === "IDLE" ? Math.sin(pulsePhase) * 4 : audioLevel * 14);

      // 1. Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.8);
      glowGrad.addColorStop(0, glow);
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rotating orbital energy ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(Math.PI / 3);
      ctx.strokeStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.2, radius * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Central Core Gradient
      const coreGrad = ctx.createRadialGradient(
        cx - radius * 0.2,
        cy - radius * 0.25,
        2,
        cx,
        cy,
        radius
      );
      coreGrad.addColorStop(0, "#FFFFFF");
      coreGrad.addColorStop(0.3, secondary);
      coreGrad.addColorStop(0.85, primary);
      coreGrad.addColorStop(1, "rgba(5, 8, 20, 0.8)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Liquid Glass Rim
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5. Orbiting Data Particles
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 6; i++) {
        const pAngle = angle * 2 + i * ((Math.PI * 2) / 6);
        const dist = radius * (1.25 + 0.1 * Math.sin(pulsePhase + i));
        const px = cx + Math.cos(pAngle) * dist;
        const py = cy + Math.sin(pAngle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 2.5 + audioLevel * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [assistantState, audioLevel]);

  // Voice synthesis
  const speakText = (text: string, onEnd?: () => void) => {
    if (!synthRef.current) {
      onEnd?.();
      return;
    }
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick English or Indian English voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang === "en-IN" ||
        v.name.includes("Natural") ||
        v.name.includes("Google") ||
        v.lang.startsWith("en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setAssistantState("SPEAKING");
    };

    utterance.onend = () => {
      setAssistantState("IDLE");
      onEnd?.();
    };

    utterance.onerror = () => {
      setAssistantState("IDLE");
      onEnd?.();
    };

    synthRef.current.speak(utterance);
  };

  // Wake word activation
  const triggerWakeWord = () => {
    synthRef.current?.cancel();
    safeStopRecognition();

    const wakeUserMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: "Sam",
      timestamp: Date.now(),
    };
    const wakeAssistantReply: ChatMessage = {
      id: Math.random().toString(),
      role: "assistant",
      content: "Yes, I'm listening.",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, wakeUserMsg, wakeAssistantReply]);
    setInputText("");
    setActiveActionBanner("Wake Word 'Sam' Detected");

    speakText("Yes, I'm listening.", () => {
      // Transition directly to listening for the user's command
      safeStartRecognition();
    });
  };

  // Process User Command (Local Android actions + Gemini AI Brain)
  const handleProcessCommand = async (command: string) => {
    const raw = command.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();

    // Check if user spoke wake word "Sam"
    if (lower === "sam" || lower === "hey sam" || lower === "hello sam") {
      triggerWakeWord();
      return;
    }

    // Add User Message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: raw,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setAssistantState("THINKING");

    // Check Local Android Commands first
    // 1. Flashlight
    if (lower.includes("flashlight on") || lower.includes("turn on flashlight") || lower.includes("torch on")) {
      setFlashlightOn(true);
      respondWithAction("Flashlight turned on.", { type: "FLASHLIGHT", param: "ON" });
      return;
    }
    if (lower.includes("flashlight off") || lower.includes("turn off flashlight") || lower.includes("torch off")) {
      setFlashlightOn(false);
      respondWithAction("Flashlight turned off.", { type: "FLASHLIGHT", param: "OFF" });
      return;
    }

    // 2. Apps: YouTube, WhatsApp, Chrome
    if (lower.includes("open youtube") || lower.includes("launch youtube")) {
      respondWithAction("Opening YouTube.", { type: "OPEN_APP", param: "YouTube" }, () => {
        window.open("https://youtube.com", "_blank");
      });
      return;
    }
    if (lower.includes("open whatsapp") || lower.includes("launch whatsapp")) {
      respondWithAction("Opening WhatsApp.", { type: "OPEN_APP", param: "WhatsApp" });
      return;
    }
    if (lower.includes("open chrome") || lower.includes("open browser")) {
      respondWithAction("Opening Google Chrome.", { type: "OPEN_APP", param: "Chrome" });
      return;
    }

    // 3. Time
    if (lower.includes("what time is it") || lower.includes("current time") || lower === "time") {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      respondWithAction(`It is ${now}.`, { type: "GET_TIME", param: now });
      return;
    }

    // 4. Alarm
    if (lower.includes("set an alarm") || lower.includes("set alarm")) {
      setAlarmScheduled("6:00 AM");
      respondWithAction("Alarm scheduled for 6:00 AM.", { type: "SET_ALARM", param: "6:00 AM" });
      return;
    }

    // 5. Volume
    if (lower.includes("increase volume") || lower.includes("volume up") || lower.includes("louder")) {
      setSystemVolume((prev) => Math.min(100, prev + 15));
      respondWithAction("Volume increased.", { type: "VOLUME", param: "UP" });
      return;
    }
    if (lower.includes("decrease volume") || lower.includes("volume down") || lower.includes("lower volume")) {
      setSystemVolume((prev) => Math.max(0, prev - 15));
      respondWithAction("Volume decreased.", { type: "VOLUME", param: "DOWN" });
      return;
    }

    // 6. Call
    if (lower.startsWith("call ")) {
      const target = raw.substring(5).trim();
      respondWithAction(`Opening dialer to call ${target}.`, { type: "CALL", param: target });
      return;
    }

    // Otherwise, dispatch to Gemini AI Brain proxy (/api/assistant/chat)
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: raw,
          language: "en-IN",
          history: messages.slice(-4),
        }),
      });

      const data = await response.json();
      const reply = data.reply || "Yes, I'm listening. How can I help you?";

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
        action: data.action,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(reply);
    } catch {
      const fallback = "I'm Sam. Local device controls are active. Connect your backend proxy for full cloud intelligence.";
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: fallback,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      speakText(fallback);
    }
  };

  const respondWithAction = (
    replyText: string,
    action: { type: string; param?: string | null },
    sideEffect?: () => void
  ) => {
    setActiveActionBanner(`${action.type}: ${action.param || "Executed"}`);
    const assistantMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "assistant",
      content: replyText,
      timestamp: Date.now(),
      action,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    speakText(replyText, sideEffect);
  };

  const toggleMic = () => {
    if (isMicListening || isListeningRef.current) {
      safeStopRecognition();
      setAssistantState("IDLE");
    } else {
      safeStartRecognition();
    }
  };

  // Border glow styles based on AssistantState
  const getBorderGlowClass = () => {
    switch (assistantState) {
      case "IDLE":
        return "border-blue-500/30 shadow-[0_0_20px_rgba(41,121,255,0.25)] animate-pulse-glow";
      case "LISTENING":
        return "border-cyan-400 shadow-[0_0_35px_rgba(0,229,255,0.7)] animate-sweep-border ring-2 ring-cyan-400/50";
      case "THINKING":
        return "border-purple-500 shadow-[0_0_35px_rgba(124,77,255,0.65)] ring-2 ring-purple-500/40 animate-pulse";
      case "SPEAKING":
        return "border-cyan-200 shadow-[0_0_40px_rgba(0,229,255,0.8)] ring-2 ring-white/50";
      default:
        return "border-blue-500/30";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-7xl mx-auto">
      {/* 1. Phone Frame Simulator */}
      <div className="w-full max-w-[390px] mx-auto shrink-0">
        <div className="relative mx-auto rounded-[46px] p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-2xl shadow-cyan-950/40 border border-slate-700/60">
          {/* Simulated Samsung Galaxy M30s Camera Notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-2xl z-30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950 ml-2" />
          </div>

          {/* Glowing Virtual Phone Screen */}
          <div
            className={`relative rounded-[36px] bg-[#050814] overflow-hidden flex flex-col h-[680px] transition-all duration-500 border-2 ${getBorderGlowClass()}`}
          >
            {/* Phone Top Header Status Bar */}
            <div className="pt-6 px-6 pb-2 flex items-center justify-between text-[11px] text-slate-400 z-20">
              <span className="font-semibold text-slate-300">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-cyan-400 font-mono">5G</span>
                <span className="text-[10px] text-emerald-400">92%</span>
              </div>
            </div>

            {/* App Brand Bar */}
            <div className="px-5 py-2.5 flex items-center justify-between z-20">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                    SAMBHAV AI
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-medium">
                    v1.0
                  </span>
                </div>
                <div className="text-[10px] text-cyan-400/90 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                  Wake Word: &quot;Sam&quot;
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {flashlightOn && (
                  <span className="p-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] flex items-center gap-1">
                    <Flashlight className="w-3 h-3 fill-amber-400" /> Torch
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Settings className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Central Assistant Stage: Liquid Glass Orb & Wave */}
            <div className="flex flex-col items-center justify-center py-2 relative z-20">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={176}
                  height={176}
                  className="rounded-full cursor-pointer hover:scale-105 transition-transform"
                  onClick={triggerWakeWord}
                  title="Click to simulate saying 'Sam'"
                />
              </div>

              {/* State Badge */}
              <div className="mt-1 flex items-center gap-2 px-3 py-1 rounded-full bg-[#121B33]/80 border border-cyan-500/30 backdrop-blur-md">
                <span
                  className={`w-2 h-2 rounded-full ${
                    assistantState === "IDLE"
                      ? "bg-blue-400"
                      : assistantState === "LISTENING"
                      ? "bg-cyan-400 animate-ping"
                      : assistantState === "THINKING"
                      ? "bg-purple-400 animate-pulse"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-xs font-medium text-cyan-300 tracking-wide uppercase">
                  {assistantState === "IDLE" && "Ready • Say \"Sam\""}
                  {assistantState === "LISTENING" && "Listening..."}
                  {assistantState === "THINKING" && "Thinking..."}
                  {assistantState === "SPEAKING" && "Speaking..."}
                </span>
              </div>
            </div>

            {/* Conversation Stream */}
            <div
              ref={chatScrollRef}
              className="flex-1 px-4 py-2 overflow-y-auto space-y-2.5 z-20 text-xs"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none"
                        : "liquid-glass-card text-slate-100 rounded-bl-none border border-cyan-500/20"
                    }`}
                  >
                    <p className="leading-relaxed">{m.content}</p>
                    {m.action && (
                      <div className="mt-1.5 pt-1.5 border-t border-cyan-500/20 flex items-center gap-1 text-[10px] text-cyan-300 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{m.action.type}: {m.action.param || "OK"}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions Floating Bar */}
            <div className="p-3 bg-gradient-to-t from-black via-[#070B1E] to-transparent z-20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputText.trim()) {
                      handleProcessCommand(inputText);
                    }
                  }}
                  placeholder={
                    assistantState === "LISTENING"
                      ? "Listening to voice..."
                      : "Ask Sam or type command..."
                  }
                  className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-full px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />

                {inputText.trim() ? (
                  <button
                    onClick={() => handleProcessCommand(inputText)}
                    className="p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={toggleMic}
                    className={`p-2.5 rounded-full shadow-lg transition-all active:scale-90 ${
                      isMicListening
                        ? "bg-red-500 text-white ring-4 ring-red-500/30"
                        : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 ring-4 ring-cyan-400/20"
                    }`}
                    title={isMicListening ? "Stop listening" : "Tap to speak"}
                  >
                    {isMicListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Action Banner toast */}
              {activeActionBanner && (
                <div className="mt-2 text-center text-[10px] text-cyan-300 font-mono truncate">
                  ⚡ {activeActionBanner}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Assistant Controls & Quick Testing */}
      <div className="flex-1 space-y-6 w-full">
        {/* Wake Word Hero Card */}
        <div className="liquid-glass-panel rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium mb-2">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                OFFLINE WAKE-WORD READY
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Wake Word: <span className="text-cyan-400 font-mono">&quot;Sam&quot;</span>
              </h2>
              <p className="text-slate-300 text-xs mt-1 max-w-lg leading-relaxed">
                Just say <strong>&quot;Sam&quot;</strong> and the assistant wakes up instantly, responds
                <span className="text-cyan-300 font-medium"> &quot;Yes, I&apos;m listening.&quot;</span>, and begins capturing your natural language command or question.
              </p>
            </div>

            <button
              onClick={triggerWakeWord}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Simulate Wake Word (&quot;Sam&quot;)
            </button>
          </div>

          {/* Quick Voice Command Pills */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Try Supported Android Voice Commands:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "Turn on flashlight",
                "Turn off flashlight",
                "Open YouTube",
                "Open WhatsApp",
                "What time is it?",
                "Set an alarm for 6 AM",
                "Increase volume",
                "Call Mom",
                "How does quantum computing work?",
                "Translate 'Hello friend' into Hindi",
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleProcessCommand(cmd)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 text-xs transition-colors text-left"
                >
                  &quot;{cmd}&quot;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Device State Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Flashlight Card */}
          <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  flashlightOn ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Flashlight className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Torch / Flashlight</div>
                <div className="text-[11px] text-slate-400">
                  {flashlightOn ? "ON (Camera2 API)" : "OFF"}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleProcessCommand(flashlightOn ? "Turn off flashlight" : "Turn on flashlight")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                flashlightOn ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-300"
              }`}
            >
              Toggle
            </button>
          </div>

          {/* Volume Control Card */}
          <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">System Volume</div>
                <div className="text-[11px] text-slate-400">{systemVolume}% (AudioManager)</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleProcessCommand("decrease volume")}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
              >
                -
              </button>
              <button
                onClick={() => handleProcessCommand("increase volume")}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Alarms Card */}
          <div className="liquid-glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Next Alarm</div>
                <div className="text-[11px] text-slate-400">
                  {alarmScheduled ? alarmScheduled : "None set"}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleProcessCommand("set an alarm for 6 AM")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 font-medium"
            >
              Set 6 AM
            </button>
          </div>
        </div>

        {/* Samsung Galaxy M30s & Android 11 Notice */}
        <div className="liquid-glass-card rounded-2xl p-4 border border-cyan-500/20 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">
              Native Android Project Configured for Samsung Galaxy M30s:
            </span>{" "}
            Includes <code className="text-cyan-300">VoiceInteractionService</code> (Default Android Digital Assistant),
            foreground microphone service with notification, 4-state <code className="text-cyan-300">GlowingBorderView</code>,
            and offline wake word spotter.
          </div>
        </div>
      </div>
    </div>
  );
};
