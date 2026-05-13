"use client";

import React from "react";
import { motion } from "framer-motion";

import VoiceCompanionOrb from "../VoiceCompanion/VoiceCompanionOrb";

export const BottomDock: React.FC = () => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-xl px-4 pointer-events-none"
    >
      <div className="dock-surface h-18 rounded-[28px] flex items-center justify-between px-8 pointer-events-auto border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
        {/* Navigation Control */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition"
        >
          <span className="text-2xl">🧭</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Explore</span>
        </motion.button>

        {/* AI Assistant Center Piece */}
        <div className="relative -top-10 w-32 h-32 flex items-center justify-center">
           <VoiceCompanionOrb />
        </div>

        {/* SOS Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center group-hover:bg-red-600 transition-colors">
            <span className="text-xl">🆘</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-red-400">Emergency</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BottomDock;
