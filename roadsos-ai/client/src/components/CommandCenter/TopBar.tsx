"use client";

import React from "react";
import { motion } from "framer-motion";

export const TopBar: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-2xl px-4 pointer-events-none"
    >
      <div className="dock-surface h-14 rounded-2xl flex items-center justify-between px-6 pointer-events-auto">
        {/* Left Side: Search */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xl opacity-60">🔍</span>
          <input
            type="text"
            placeholder="Search city, emergency, or risk..."
            className="bg-transparent border-none outline-none text-white placeholder-white/40 w-full text-sm font-medium"
          />
        </div>

        {/* Center: Location (Dynamic later) */}
        <div className="hidden md:flex items-center gap-2 px-4 border-l border-r border-white/10">
          <span className="text-cyan-400">📍</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Pune City Core</span>
        </div>

        {/* Right Side: Weather & Profile */}
        <div className="flex items-center gap-4 pl-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <span className="text-sm font-bold">28°C</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-white/20 flex items-center justify-center cursor-pointer overflow-hidden shadow-lg"
          >
            <div className="w-full h-full bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=RoadSoS')] bg-cover" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TopBar;
