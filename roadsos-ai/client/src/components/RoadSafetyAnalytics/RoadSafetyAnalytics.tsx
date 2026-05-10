"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SafetyZone {
  id: string;
  name: string;
  riskLevel: "safe" | "warning" | "danger" | "critical";
  accidents: number;
  avgSpeed: number;
  weatherImpact: string;
  aiPrediction: number;
}

const SAFETY_ZONES: SafetyZone[] = [
  {
    id: "zone-1",
    name: "Highway 101 - Morning Rush",
    riskLevel: "critical",
    accidents: 23,
    avgSpeed: 78,
    weatherImpact: "Fog - visibility 50m",
    aiPrediction: 92,
  },
  {
    id: "zone-2",
    name: "Downtown 5th & Main",
    riskLevel: "danger",
    accidents: 18,
    avgSpeed: 35,
    weatherImpact: "Rain - wet roads",
    aiPrediction: 78,
  },
  {
    id: "zone-3",
    name: "Freeway Exit 42",
    riskLevel: "warning",
    accidents: 12,
    avgSpeed: 45,
    weatherImpact: "Clear",
    aiPrediction: 64,
  },
  {
    id: "zone-4",
    name: "Residential District B",
    riskLevel: "safe",
    accidents: 2,
    avgSpeed: 25,
    weatherImpact: "Clear",
    aiPrediction: 18,
  },
];

export default function RoadSafetyAnalytics() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);

  const getRiskColor = (level: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      critical: { bg: "from-red-600/30 to-red-700/20", text: "text-red-300", border: "border-red-400/30" },
      danger: { bg: "from-orange-600/30 to-orange-700/20", text: "text-orange-300", border: "border-orange-400/30" },
      warning: { bg: "from-yellow-600/30 to-yellow-700/20", text: "text-yellow-300", border: "border-yellow-400/30" },
      safe: { bg: "from-emerald-600/30 to-emerald-700/20", text: "text-emerald-300", border: "border-emerald-400/30" },
    };
    return colors[level];
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-32 right-28 z-[65] w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:shadow-lg shadow-lg flex items-center justify-center text-white font-black text-lg border border-purple-400/50 transition pointer-events-auto"
        title="Road Safety Analytics"
      >
        📊
      </motion.button>

      {/* Analytics Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-48 right-0 z-[65] w-96 glass-ultra rounded-2xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto m-6"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-b border-white/10 px-6 py-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-black text-white">Road Safety</h3>
                  <p className="text-xs text-white/60 mt-1">AI Predictive Analytics</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Zones List or Detail */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "400px" }}>
              {!selectedZone ? (
                // List View
                SAFETY_ZONES.map((zone, idx) => {
                  const colors = getRiskColor(zone.riskLevel);
                  return (
                    <motion.button
                      key={zone.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedZone(zone)}
                      className={`w-full text-left bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-lg p-3 hover:border-white/30 transition group`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-bold text-white text-sm group-hover:text-white/80 transition">{zone.name}</p>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-lg font-black">{zone.aiPrediction}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={colors.text}>●</span>
                        <span className="text-white/70">{zone.riskLevel.toUpperCase()}</span>
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                // Detail View
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="text-xs font-bold text-cyan-300 hover:text-cyan-200 mb-3 flex items-center gap-1"
                  >
                    ← Back to zones
                  </button>

                  <div className="space-y-3">
                    <div className="bg-white/10 border border-white/10 rounded-lg p-3">
                      <h4 className="text-lg font-black text-white mb-2">{selectedZone.name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">Risk Level</span>
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white uppercase">
                            {selectedZone.riskLevel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">Recent Accidents</span>
                          <span className="text-sm font-bold text-red-300">{selectedZone.accidents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">Avg Speed</span>
                          <span className="text-sm font-bold text-white">{selectedZone.avgSpeed} km/h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">Weather Impact</span>
                          <span className="text-sm font-bold text-white">{selectedZone.weatherImpact}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Prediction Bar */}
                    <div className="bg-white/10 border border-white/10 rounded-lg p-3">
                      <p className="text-xs text-white/60 font-bold mb-2">AI Risk Prediction</p>
                      <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedZone.aiPrediction}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-2">{selectedZone.aiPrediction}% Accident Probability</p>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-400/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-cyan-200 mb-2">⚡ AI Recommendations</p>
                      <ul className="text-xs text-white/70 space-y-1">
                        <li>• Avoid peak hours (7-9 AM, 5-7 PM)</li>
                        <li>• Reduce speed by 20% due to weather</li>
                        <li>• Use alternative route via Highway 42</li>
                        <li>• Enable extra vehicle safety systems</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Stats Footer */}
            <div className="border-t border-white/10 px-4 py-3 bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">Updated</p>
                <motion.p
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-bold text-cyan-300"
                >
                  Real-time
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
