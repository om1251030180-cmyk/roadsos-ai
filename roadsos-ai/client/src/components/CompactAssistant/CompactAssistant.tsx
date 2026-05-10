"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import axios from "axios";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  isEmergency?: boolean;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

/**
 * Compact mini AI assistant orb
 * Features:
 * - Floating, draggable orb
 * - Expands on interaction
 * - Smart assistant panel
 * - Embedded in map experience
 * - Minimal space footprint
 * - Animated reactions
 */
export const CompactAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      text: "Emergency AI ready. Say 'help' or ask a question.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragConstraints = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const emergencyMode = useMemo(
    () => messages.some((m) => m.isEmergency),
    [messages]
  );

  const handleSendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const response = await axios.post<{
        reply: string;
        meta?: { isEmergency?: boolean };
      }>("http://localhost:4000/api/chat", {
        message: trimmed,
        language: "en",
      });

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: response.data.reply,
        isEmergency: response.data.meta?.isEmergency,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: "Service temporarily unavailable. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window))
      return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setText(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div ref={dragConstraints} className="fixed inset-0 z-30 pointer-events-none">
      {/* Compact Orb - Always Visible */}
      <motion.div
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.2}
        dragTransition={{ power: 0.3, restDelta: 0.001 }}
        initial={{ x: -80, y: 80, opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-24 right-8 z-30 pointer-events-auto"
      >
        <motion.button
          onClick={() => setIsExpanded((v) => !v)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl cursor-grab active:cursor-grabbing transition ${
            emergencyMode
              ? "bg-gradient-to-br from-red-600 to-orange-600 border-2 border-red-300 animate-pulse"
              : "bg-gradient-to-br from-cyan-500 to-blue-500 border-2 border-cyan-300"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🤖
        </motion.button>
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-40 right-8 z-40 pointer-events-auto"
          >
            <div className="w-80 glass-panel-bright rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Header */}
              <div
                className={`p-4 bg-gradient-to-r ${
                  emergencyMode
                    ? "from-red-600 to-orange-600"
                    : "from-cyan-500 to-blue-500"
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-white/80">
                      Smart Assistant
                    </p>
                    <p className="text-xs text-white/70">
                      {emergencyMode ? "🚨 Emergency Mode" : "Ready to help"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:opacity-70 transition text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Messages Area */}
              <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white/5">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-cyan-500/40 text-cyan-100 border border-cyan-400/30"
                          : `${
                              msg.isEmergency
                                ? "bg-red-500/40 text-red-100 border border-red-400/30"
                                : "bg-white/10 text-white/80 border border-white/20"
                            }`
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20">
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Thinking...
                      </motion.span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) handleSendMessage();
                    }}
                    placeholder="Ask something..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 text-sm"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={loading || !text.trim()}
                    className="px-3 py-2 rounded-lg bg-cyan-500/40 hover:bg-cyan-500/60 disabled:opacity-50 transition text-white font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send
                  </motion.button>
                </div>

                {/* Voice Button */}
                <motion.button
                  onClick={startListening}
                  disabled={isListening}
                  className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                    isListening
                      ? "bg-red-500/40 text-red-100 border border-red-400/30"
                      : "bg-white/10 hover:bg-white/20 text-white/70 border border-white/20"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🎤</span>
                  {isListening ? "Listening..." : "Voice Input"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompactAssistant;
