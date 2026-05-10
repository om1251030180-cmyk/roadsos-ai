"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type AIState = "idle" | "listening" | "thinking" | "speaking" | "emergency";
type ChatMode = "companion" | "law" | "report";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isEmergency?: boolean;
  timestamp: number;
}

export default function HolographicAI() {
  const [isOpen, setIsOpen] = useState(true);
  const [aiState, setAiState] = useState<AIState>("idle");
  const [mode, setMode] = useState<ChatMode>("companion");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      text: "RoadSoS Neural Guide online. Ask me anything about emergency routing, traffic laws, or road safety.",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onstart = () => {
          setAiState("listening");
          setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onresult = (event: any) => {
          let interim_transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInputText((prev) => prev + transcript);
            } else {
              interim_transcript += transcript;
            }
          }
        };
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentLocation = async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;
    return await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setAiState("thinking");

    try {
      const location = await getCurrentLocation();
      const response = await axios.post<{ reply: string; meta: { isEmergency: boolean } }>(
        "http://localhost:4000/api/chat",
        {
          message: trimmed,
          mode,
          language: "en",
          ...(location && { lat: location.lat, lng: location.lng }),
        }
      );

      setAiState("speaking");
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assist`,
        role: "assistant",
        text: response.data.reply,
        isEmergency: response.data.meta?.isEmergency,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Text-to-speech
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response.data.reply);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => setAiState("idle");
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        text: "I'm having trouble connecting. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAiState("idle");
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 pointer-events-auto">
      {/* Holographic Orb */}
      <motion.div
        animate={{
          scale: aiState === "emergency" ? [1, 1.2, 1] : 1,
          y: aiState === "idle" ? [0, -8, 0] : 0,
        }}
        transition={{
          duration: aiState === "emergency" ? 0.6 : 2,
          repeat: aiState === "emergency" ? Infinity : aiState === "idle" ? Infinity : 0,
          ease: "easeInOut",
        }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-24 h-24 cursor-pointer rounded-full flex items-center justify-center transition-all ${
          aiState === "emergency"
            ? "bg-gradient-to-br from-red-600 to-orange-600 shadow-red-500/50 emergency-pulse"
            : aiState === "listening"
              ? "bg-gradient-to-br from-cyan-500 to-blue-500"
              : aiState === "thinking"
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : aiState === "speaking"
                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500"
                  : "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600"
        } holo-glow`}
      >
        {/* Orbiting rings */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: "4s" }} />
        <div className="absolute inset-2 rounded-full border border-white/20 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />

        {/* AI States Visual */}
        {aiState === "listening" && (
          <>
            <div className="absolute inset-0 pulse-rings" style={{ borderRadius: "50%", border: "2px solid rgba(34, 211, 238, 0.6)" }} />
            <div className="absolute inset-0 pulse-rings" style={{ borderRadius: "50%", border: "2px solid rgba(34, 211, 238, 0.4)", animationDelay: "0.5s" }} />
          </>
        )}

        {aiState === "thinking" && (
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }}>
            <div className="absolute w-full h-full rounded-full border-2 border-transparent border-t-white border-r-white/50" />
          </div>
        )}

        {aiState === "speaking" && (
          <div className="flex gap-1 items-center justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full"
                style={{
                  height: "16px",
                  animation: "pulse 0.6s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Center glow */}
        <div className="w-8 h-8 rounded-full bg-white/20 glow-effect" />
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-96 h-[600px] rounded-3xl glass-ultra overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600/40 to-purple-600/40 border-b border-white/10 px-6 py-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-white">RoadSoS AI</h2>
                  <p className="text-xs text-white/60 mt-1">
                    {aiState === "listening" ? "🎙️ Listening..." : aiState === "thinking" ? "🧠 Analyzing..." : aiState === "speaking" ? "🗣️ Speaking..." : "Ready"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 transition text-white"
                >
                  ✕
                </button>
              </div>

              {/* Mode Selector */}
              <div className="flex gap-2">
                {(["companion", "law", "report"] as ChatMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition ${
                      mode === m
                        ? "bg-cyan-500/80 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {m === "companion" ? "🤖" : m === "law" ? "⚖️" : "📝"} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-cyan-600/40 text-white border border-cyan-400/30"
                        : msg.isEmergency
                          ? "bg-red-600/30 text-red-100 border border-red-400/30"
                          : "bg-white/10 text-white/90 border border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="border-t border-white/10 px-4 py-3 grid grid-cols-2 gap-2">
              {["Nearest Hospital", "DUI Penalties", "Report Pothole", "Safe Route"].map((action) => (
                <button
                  key={action}
                  onClick={() => setInputText(action)}
                  className="text-xs px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition border border-white/10"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-4 py-3 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask RoadSoS AI..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-cyan-400/50"
              />
              <button
                onClick={toggleListening}
                className={`px-3 py-2 rounded-lg transition ${
                  isListening ? "bg-red-600/60 text-white" : "bg-cyan-600/60 text-white hover:bg-cyan-600/80"
                }`}
              >
                🎤
              </button>
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-3 py-2 bg-cyan-600/80 hover:bg-cyan-600 text-white rounded-lg transition disabled:opacity-50"
              >
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
