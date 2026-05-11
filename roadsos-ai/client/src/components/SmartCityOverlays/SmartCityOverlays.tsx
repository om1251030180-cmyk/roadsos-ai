"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LayerType = "emergency" | "danger" | "infrastructure" | "ai-intelligence";

interface SmartCityLayer {
  id: LayerType;
  label: string;
  icon: string;
  description: string;
  color: string;
  items: Array<{ name: string; count: number; icon: string }>;
}

interface SmartCityOverlaysProps {
  dockMode?: boolean;
  className?: string;
}

const LAYERS: SmartCityLayer[] = [
  {
    id: "emergency",
    label: "Emergency Network",
    icon: "🚨",
    description: "Real-time emergency services",
    color: "from-red-500 to-orange-500",
    items: [
      { name: "Hospitals", count: 12, icon: "🏥" },
      { name: "Ambulances", count: 8, icon: "🚑" },
      { name: "Police", count: 6, icon: "👮" },
      { name: "Fire Stations", count: 3, icon: "🚒" },
    ],
  },
  {
    id: "danger",
    label: "Danger Zones",
    icon: "⚠️",
    description: "High-risk areas and accidents",
    color: "from-yellow-500 to-red-600",
    items: [
      { name: "Accident Zones", count: 14, icon: "💥" },
      { name: "Flood Areas", count: 3, icon: "🌊" },
      { name: "Unsafe Turns", count: 8, icon: "🔄" },
      { name: "Potholes", count: 22, icon: "🕳️" },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    icon: "🏗️",
    description: "Roads, construction, maintenance",
    color: "from-blue-500 to-cyan-500",
    items: [
      { name: "Under Construction", count: 5, icon: "🚧" },
      { name: "Road Quality Issues", count: 18, icon: "🛣️" },
      { name: "CCTV Cameras", count: 42, icon: "📹" },
      { name: "Traffic Signals", count: 67, icon: "🚦" },
    ],
  },
  {
    id: "ai-intelligence",
    label: "AI Intelligence",
    icon: "🧠",
    description: "Predictive analytics & insights",
    color: "from-purple-500 to-pink-500",
    items: [
      { name: "Risk Scores", count: 156, icon: "📊" },
      { name: "Safe Routes", count: 89, icon: "✅" },
      { name: "Predictions", count: 24, icon: "🔮" },
      { name: "Alerts Generated", count: 7, icon: "🔔" },
    ],
  },
];

export default function SmartCityOverlays({ dockMode = false, className = "" }: SmartCityOverlaysProps) {
  const [activeLayer, setActiveLayer] = useState<LayerType | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<LayerType>>(new Set(["emergency"]));

  const toggleLayerVisibility = (layerId: LayerType) => {
    const newLayers = new Set(visibleLayers);
    if (newLayers.has(layerId)) {
      newLayers.delete(layerId);
    } else {
      newLayers.add(layerId);
    }
    setVisibleLayers(newLayers);
  };

  const selectedLayer = LAYERS.find((l) => l.id === activeLayer);

  return (
    <div className={`${dockMode ? "relative w-full" : "fixed top-28 right-6"} z-40 pointer-events-auto ${className}`}>
      {/* Layer Toggle Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-ultra rounded-[28px] overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Smart City Layers</h3>
              <p className="text-xs text-white/60 mt-1">Real-time intelligence network</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/80">
              Contextual
            </div>
          </div>
        </div>

        {/* Layer Buttons */}
        <div className="p-4 space-y-2">
          {LAYERS.map((layer) => (
            <motion.div key={layer.id} whileHover={{ x: 4 }}>
              <button
                onClick={() => {
                  setActiveLayer(activeLayer === layer.id ? null : layer.id);
                  toggleLayerVisibility(layer.id);
                }}
                className={`w-full px-4 py-3 rounded-2xl transition-all border text-left ${
                  visibleLayers.has(layer.id)
                    ? `bg-gradient-to-r ${layer.color} bg-opacity-20 border-white/30`
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{layer.icon}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{layer.label}</p>
                      <p className="text-xs text-white/60">{layer.description}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition ${visibleLayers.has(layer.id) ? "bg-white/20 border-white/40" : "border-white/20"}`} />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Layer Info Panel */}
      <AnimatePresence>
        {selectedLayer && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`${dockMode ? "relative mt-3" : "absolute top-0 right-full -mr-2 mt-16"} w-72 glass-ultra rounded-[28px] overflow-hidden shadow-2xl border border-white/10`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${selectedLayer.color} bg-opacity-20 border-b border-white/10 px-6 py-5`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedLayer.icon}</span>
                <h4 className="text-xl font-black text-white">{selectedLayer.label}</h4>
              </div>
              <p className="text-sm text-white/70">{selectedLayer.description}</p>
            </div>

            {/* Items Grid */}
            <div className="p-4 space-y-3">
              {selectedLayer.items.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.name}</p>
                        <p className="text-xs text-white/50">Live monitoring</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center"
                      >
                        <p className="text-sm font-black text-cyan-300">{item.count}</p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Footer */}
            <div className="border-t border-white/10 px-6 py-4 bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">Last Updated</p>
                <motion.p
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm font-bold text-cyan-400"
                >
                  Now
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
