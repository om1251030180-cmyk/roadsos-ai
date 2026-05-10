"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveUpdate {
  id: string;
  type: "incident" | "alert" | "service" | "traffic";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  icon: string;
}

export default function LiveIncidentFeed() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([
    {
      id: "upd-1",
      type: "incident",
      title: "Multi-Vehicle Collision",
      description: "Highway 101, Sector 5 - 2 vehicles, medical assistance dispatched",
      severity: "critical",
      timestamp: Date.now() - 120000,
      icon: "💥",
    },
    {
      id: "upd-2",
      type: "alert",
      title: "Severe Weather Alert",
      description: "Heavy fog expected in downtown area, visibility <50m",
      severity: "high",
      timestamp: Date.now() - 300000,
      icon: "🌫️",
    },
    {
      id: "upd-3",
      type: "service",
      title: "Ambulance En Route",
      description: "Unit 42 responding to Highway 101 incident, ETA 4 minutes",
      severity: "medium",
      timestamp: Date.now() - 180000,
      icon: "🚑",
    },
    {
      id: "upd-4",
      type: "traffic",
      title: "Traffic Congestion",
      description: "Main Street - Peak hour congestion, consider alternate routes",
      severity: "medium",
      timestamp: Date.now() - 600000,
      icon: "🚗",
    },
  ]);

  const [isExpanded, setIsExpanded] = useState(false);

  const getUpdateColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "from-red-600/30 to-red-700/20 border-red-400/30",
      high: "from-orange-600/30 to-orange-700/20 border-orange-400/30",
      medium: "from-yellow-600/30 to-yellow-700/20 border-yellow-400/30",
      low: "from-blue-600/30 to-blue-700/20 border-blue-400/30",
    };
    return colors[severity] || "from-gray-600/30 to-gray-700/20 border-gray-400/30";
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <>
      {/* Compact Feed Indicator */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{ y: isExpanded ? 0 : [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed top-6 right-6 z-[65] pointer-events-auto group"
      >
        <div className="relative">
          <div className="glass-ultra rounded-2xl px-4 py-3 border border-white/10 hover:border-white/30 transition">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-sm font-bold text-white">Live Feed</span>
              <span className="text-xs bg-red-600/40 text-red-200 px-2 py-1 rounded-full font-bold">{updates.length}</span>
            </div>
          </div>

          {/* Notification Dots */}
          {!isExpanded && (
            <div className="absolute -top-2 -right-2 flex gap-1">
              {updates.slice(0, 3).map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                />
              ))}
            </div>
          )}
        </div>
      </motion.button>

      {/* Expanded Feed Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-24 right-6 z-[65] w-96 glass-ultra rounded-2xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600/30 to-orange-600/30 border-b border-white/10 px-6 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-black text-white">Live Incident Feed</h3>
                  <p className="text-xs text-white/60 mt-1">Real-time updates from the network</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Updates List */}
            <div className="overflow-y-auto space-y-2 p-4" style={{ maxHeight: "500px" }}>
              {updates.map((update, idx) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-gradient-to-r ${getUpdateColor(update.severity)} border rounded-lg p-3 hover:border-white/30 transition group cursor-pointer`}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{update.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-white/80 transition">
                          {update.title}
                        </h4>
                        <span className="text-xs text-white/60 flex-shrink-0">{formatTime(update.timestamp)}</span>
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2">{update.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          update.severity === "critical"
                            ? "bg-red-600/40 text-red-200"
                            : update.severity === "high"
                              ? "bg-orange-600/40 text-orange-200"
                              : update.severity === "medium"
                                ? "bg-yellow-600/40 text-yellow-200"
                                : "bg-blue-600/40 text-blue-200"
                        }`}>
                          {update.severity}
                        </span>
                        {update.severity === "critical" && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-xs"
                          >
                            ⚡
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-3 bg-white/5">
              <p className="text-xs text-white/60">
                <motion.span
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Updates arriving in real-time...
                </motion.span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
