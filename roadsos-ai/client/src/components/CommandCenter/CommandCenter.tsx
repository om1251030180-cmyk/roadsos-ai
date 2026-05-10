"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MetricCard {
  label: string;
  value: string | number;
  trend: number;
  icon: string;
  color: string;
}

interface ActiveIncident {
  id: string;
  type: "accident" | "emergency" | "hazard";
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  description: string;
}

export default function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([
    { label: "Live Incidents", value: 7, trend: 2, icon: "🚨", color: "text-red-400" },
    { label: "Avg Response Time", value: "3.4m", trend: -0.5, icon: "⏱️", color: "text-cyan-400" },
    { label: "Network Coverage", value: "98.5%", trend: 1.2, icon: "📡", color: "text-emerald-400" },
    { label: "AI Predictions Accuracy", value: "94.2%", trend: 2.1, icon: "🧠", color: "text-purple-400" },
  ]);

  const [incidents, setIncidents] = useState<ActiveIncident[]>([
    {
      id: "INC-001",
      type: "accident",
      location: "Highway 101, Sector 5",
      severity: "high",
      timestamp: Date.now() - 300000,
      description: "Multi-vehicle collision, 2 injured",
    },
    {
      id: "INC-002",
      type: "hazard",
      location: "Main Street, Bridge Area",
      severity: "medium",
      timestamp: Date.now() - 600000,
      description: "Pothole - 0.5m diameter, vehicle risk",
    },
    {
      id: "INC-003",
      type: "emergency",
      location: "Central Hospital Access",
      severity: "critical",
      timestamp: Date.now() - 120000,
      description: "Emergency routing - Ambulance ETA 4min",
    },
  ]);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "from-red-600 to-red-700",
      high: "from-orange-600 to-orange-700",
      medium: "from-yellow-600 to-yellow-700",
      low: "from-blue-600 to-blue-700",
    };
    return colors[severity] || "from-gray-600 to-gray-700";
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
      {/* Command Center Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-[65] w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 hover:shadow-lg shadow-lg flex items-center justify-center text-white font-black text-2xl border border-cyan-400/50 transition pointer-events-auto"
        title="Command Center"
      >
        ⌘
      </button>

      {/* Command Center Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-4 z-[75] glass-ultra rounded-3xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-b border-white/10 px-8 py-6 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">RoadSoS Command Center</h1>
              <p className="text-white/70 mt-2">Real-time smart city emergency intelligence</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/10 hover:bg-white/20 p-3 text-xl text-white transition"
            >
              ✕
            </button>
          </div>

          {/* Content Grid */}
          <div className="overflow-y-auto p-8 space-y-8" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {/* Key Metrics */}
            <div>
              <h2 className="text-2xl font-black text-white mb-4">📊 Network Metrics</h2>
              <div className="grid grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-4 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{metric.icon}</span>
                      <div className={`text-xs font-bold ${metric.trend > 0 ? "text-green-400" : "text-red-400"}`}>
                        {metric.trend > 0 ? "↑" : "↓"} {Math.abs(metric.trend)}%
                      </div>
                    </div>
                    <p className="text-xs text-white/60 font-bold">{metric.label}</p>
                    <p className={`text-2xl font-black mt-1 ${metric.color}`}>{metric.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Incidents */}
            <div>
              <h2 className="text-2xl font-black text-white mb-4">🚨 Active Incidents</h2>
              <div className="space-y-3">
                {incidents.map((incident, idx) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-gradient-to-r ${getSeverityColor(incident.severity)} bg-opacity-20 border border-white/10 rounded-xl p-4 hover:border-white/30 transition cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-bold text-white">{incident.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            incident.severity === "critical"
                              ? "bg-red-600/40 text-red-100"
                              : incident.severity === "high"
                                ? "bg-orange-600/40 text-orange-100"
                                : incident.severity === "medium"
                                  ? "bg-yellow-600/40 text-yellow-100"
                                  : "bg-blue-600/40 text-blue-100"
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white">{incident.description}</h3>
                        <p className="text-sm text-white/70 mt-1">📍 {incident.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60 font-bold">{formatTime(incident.timestamp)}</p>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mt-2 w-3 h-3 rounded-full bg-red-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/60">Emergency Services:</span>
                      <span className="font-bold text-emerald-300">🚑 Ambulance ETA 4m</span>
                      <span className="font-bold text-cyan-300">🚗 Police ETA 5m</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/60 font-bold mb-2">API Health</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-green-300">All Systems Operational</p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/60 font-bold mb-2">Database</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-green-300">Connected</p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/60 font-bold mb-2">AI Engine</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-green-300">Processing</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
