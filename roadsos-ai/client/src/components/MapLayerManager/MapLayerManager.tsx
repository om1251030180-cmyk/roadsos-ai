"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type MapLayer = 
  | "hospitals" 
  | "ambulances" 
  | "police" 
  | "risk-zones" 
  | "traffic" 
  | "flood" 
  | "construction" 
  | "road-quality" 
  | "safe-routes" 
  | "cctv" 
  | "night-safety";

interface LayerConfig {
  id: MapLayer;
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  description: string;
}

const LAYER_CONFIGS: Record<MapLayer, LayerConfig> = {
  hospitals: {
    id: "hospitals",
    label: "Hospitals",
    icon: "🏥",
    color: "from-blue-500 to-cyan-500",
    glowColor: "rgba(34, 211, 238, 0.4)",
    description: "Trauma centers and emergency care",
  },
  ambulances: {
    id: "ambulances",
    label: "Ambulances",
    icon: "🚑",
    color: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
    description: "Available ambulance services",
  },
  police: {
    id: "police",
    label: "Police Stations",
    icon: "🚨",
    color: "from-red-500 to-orange-500",
    glowColor: "rgba(239, 68, 68, 0.4)",
    description: "Law enforcement stations",
  },
  "risk-zones": {
    id: "risk-zones",
    label: "Risk Zones",
    icon: "⚠️",
    color: "from-red-600 to-yellow-600",
    glowColor: "rgba(220, 38, 38, 0.4)",
    description: "Accident-prone and danger areas",
  },
  traffic: {
    id: "traffic",
    label: "Live Traffic",
    icon: "🚦",
    color: "from-yellow-500 to-orange-500",
    glowColor: "rgba(234, 179, 8, 0.4)",
    description: "Real-time traffic density",
  },
  flood: {
    id: "flood",
    label: "Flood Zones",
    icon: "💧",
    color: "from-blue-600 to-indigo-600",
    glowColor: "rgba(79, 70, 229, 0.4)",
    description: "Flood risk and water hazards",
  },
  construction: {
    id: "construction",
    label: "Construction",
    icon: "🏗️",
    color: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
    description: "Active construction zones",
  },
  "road-quality": {
    id: "road-quality",
    label: "Road Quality",
    icon: "🛣️",
    color: "from-slate-500 to-gray-500",
    glowColor: "rgba(107, 114, 128, 0.4)",
    description: "Road surface condition analysis",
  },
  "safe-routes": {
    id: "safe-routes",
    label: "Safe Routes",
    icon: "✅",
    color: "from-green-500 to-emerald-500",
    glowColor: "rgba(34, 197, 94, 0.4)",
    description: "AI-recommended safest routes",
  },
  cctv: {
    id: "cctv",
    label: "CCTV Coverage",
    icon: "📹",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
    description: "Monitored camera locations",
  },
  "night-safety": {
    id: "night-safety",
    label: "Night Safety",
    icon: "🌙",
    color: "from-indigo-500 to-purple-500",
    glowColor: "rgba(99, 102, 241, 0.4)",
    description: "Safe zones during night hours",
  },
};

interface MapLayerManagerProps {
  activeLayers?: MapLayer[];
  onLayerToggle?: (layer: MapLayer) => void;
  compact?: boolean;
}

/**
 * Professional map layer toggle system with glassmorphism
 * Features:
 * - Smooth animations when toggled
 * - Color-coded layers
 * - Descriptive tooltips
 * - Compact or expanded modes
 * - Auto-hide when inactive
 */
export const MapLayerManager: React.FC<MapLayerManagerProps> = ({
  activeLayers = [],
  onLayerToggle = () => {},
  compact = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [hoveredLayer, setHoveredLayer] = useState<MapLayer | null>(null);

  const handleToggleLayer = useCallback(
    (layer: MapLayer) => {
      onLayerToggle(layer);
    },
    [onLayerToggle]
  );

  const layerEntries = Object.entries(LAYER_CONFIGS);

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50 pointer-events-auto"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(compact ? false : true)}
    >
      {/* Compact Button - Layer Count */}
      {compact && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border border-cyan-300/50 backdrop-blur-xl hover:from-cyan-500/60 hover:to-blue-500/60 transition flex items-center justify-center text-lg font-black shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🗺️
        </motion.button>
      )}

      {/* Expanded Layer Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 w-72 glass-panel-bright rounded-2xl p-4 shadow-xl"
          >
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-black">
                Map Layers
              </p>
              <p className="text-sm text-white/70 mt-1">
                {activeLayers.length} layer{activeLayers.length !== 1 ? "s" : ""} active
              </p>
            </div>

            {/* Layer List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {layerEntries.map(([, config]) => {
                const isActive = activeLayers.includes(config.id);
                const isHovered = hoveredLayer === config.id;

                return (
                  <motion.button
                    key={config.id}
                    onClick={() => handleToggleLayer(config.id)}
                    onMouseEnter={() => setHoveredLayer(config.id)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold">{config.label}</p>
                      {isHovered && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-white/60 leading-tight"
                        >
                          {config.description}
                        </motion.p>
                      )}
                    </div>
                    <motion.div
                      animate={{
                        scale: isActive ? 1 : 0.5,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      className="w-2 h-2 rounded-full bg-current"
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                Click to toggle layers on the map
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MapLayerManager;
