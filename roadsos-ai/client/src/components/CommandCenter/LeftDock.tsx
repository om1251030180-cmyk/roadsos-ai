"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LAYER_ITEMS = [
  { id: "emergency", icon: "🚨", label: "Emergency Services", color: "text-red-400" },
  { id: "traffic", icon: "🚦", label: "Live Traffic", color: "text-amber-400" },
  { id: "road_quality", icon: "🛣️", label: "Road Surface", color: "text-emerald-400" },
  { id: "flood", icon: "🌊", label: "Flood Risk", color: "text-blue-400" },
  { id: "ai_risk", icon: "🧠", label: "AI Prediction", color: "text-cyan-400" },
];

export const LeftDock: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState<string[]>(["emergency"]);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-[1001] flex flex-col gap-3 pointer-events-none"
    >
      <div className="dock-surface w-16 py-6 rounded-3xl flex flex-col items-center gap-6 pointer-events-auto border border-white/10 shadow-2xl">
        {LAYER_ITEMS.map((item) => (
          <div key={item.id} className="relative group">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleLayer(item.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                activeLayers.includes(item.id)
                  ? "bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.15)] border border-white/20"
                  : "hover:bg-white/5 opacity-50 hover:opacity-100"
              }`}
            >
              <span className={item.color}>{item.icon}</span>
            </motion.button>

            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tracking-wider uppercase">
              {item.label}
            </div>

            {/* Active Indicator */}
            {activeLayers.includes(item.id) && (
              <motion.div
                layoutId="active-indicator"
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full"
              />
            )}
          </div>
        ))}

        <div className="w-8 h-[1px] bg-white/10 my-2" />

        <motion.button
          whileHover={{ rotate: 90 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:bg-white/5 opacity-40 hover:opacity-80"
        >
          ⚙️
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LeftDock;
