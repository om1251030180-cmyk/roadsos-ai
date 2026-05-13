"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * JARVIS / VisionOS style Holographic AI Assistant
 * Features:
 * - Breathing idle state
 * - Listening ripple waves
 * - Thinking particle rotation
 * - Speaking waveform glow
 * - Location-aware intelligence
 */
export const VoiceCompanionOrb: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Simulate AI states for demo
  useEffect(() => {
    if (status === "listening") {
      const timer = setTimeout(() => setStatus("thinking"), 3000);
      return () => clearTimeout(timer);
    }
    if (status === "thinking") {
      const timer = setTimeout(() => setStatus("speaking"), 2000);
      return () => clearTimeout(timer);
    }
    if (status === "speaking") {
      const timer = setTimeout(() => setStatus("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleOrbClick = () => {
    if (status === "idle") {
      setStatus("listening");
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="relative z-[1005] pointer-events-none">
      <div className="relative flex flex-col items-center">
        
        {/* AI Transcript Bubble */}
        <AnimatePresence>
          {(status !== "idle" || isExpanded) && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-24 w-64 glass-ultra p-4 rounded-2xl border border-cyan-400/20 shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  {status === "idle" ? "System Ready" : status}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                {status === "idle" && "How can I assist you with your journey today?"}
                {status === "listening" && "Listening to your request..."}
                {status === "thinking" && "Analyzing smart-city data nodes..."}
                {status === "speaking" && "I've optimized your route to avoid the flood risk area near Central Park."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Holographic Orb */}
        <motion.div
          drag
          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="pointer-events-auto cursor-pointer relative"
          onClick={handleOrbClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Outer Glow Rings */}
          <div className="absolute inset-[-20px] rounded-full border border-cyan-400/10 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-[-10px] rounded-full border border-cyan-400/20 animate-[spin_15s_linear_infinite_reverse]" />
          
          {/* Core Orb */}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-700 ${
            status === 'listening' ? 'shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'shadow-[0_0_40px_rgba(34,211,238,0.3)]'
          }`}>
            {/* Background Layers */}
            <div className={`absolute inset-0 transition-colors duration-700 ${
              status === 'listening' ? 'bg-red-500/20' : 'bg-cyan-500/20'
            }`} />
            
            {/* Holographic Wave Layers */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: status === 'speaking' ? [1, 1.2, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 0.5, repeat: Infinity }
              }}
              className="absolute inset-0 opacity-40 bg-[conic-gradient(from_0deg,transparent,#22d3ee,transparent)]"
            />
            
            {/* Center Content */}
            <div className="relative z-10 text-3xl">
              {status === "idle" && "🤖"}
              {status === "listening" && "🎤"}
              {status === "thinking" && "🧠"}
              {status === "speaking" && "🗣️"}
            </div>

            {/* Ripple Effects for Listening */}
            {status === "listening" && (
              <>
                <div className="absolute inset-0 border-2 border-red-400/40 rounded-full animate-ping" />
                <div className="absolute inset-2 border-2 border-red-400/20 rounded-full animate-ping [animation-delay:0.5s]" />
              </>
            )}

            {/* Scanning Effect for Thinking */}
            {status === "thinking" && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent h-4 w-full animate-[scan_1.5s_ease-in-out_infinite]" />
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-40px); }
          100% { transform: translateY(80px); }
        }
      `}</style>
    </div>
  );
};

export default VoiceCompanionOrb;
