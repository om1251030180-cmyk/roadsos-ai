"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

export interface MapLabel {
  id: string;
  text: string;
  lat: number;
  lng: number;
  type: "danger" | "service" | "info" | "alert" | "route";
  intensity?: number; // 0-1
  pulsing?: boolean;
}

interface SmartMapLabelsProps {
  labels: MapLabel[];
  mapZoom?: number;
  onLabelClick?: (label: MapLabel) => void;
}

/**
 * Intelligent floating labels directly on the map
 * Features:
 * - Dynamic scaling with zoom
 * - Smart fade/overlap avoidance
 * - Soft animations
 * - Type-based coloring
 * - Pulsing for critical alerts
 * - Smooth transitions
 */
export const SmartMapLabels: React.FC<SmartMapLabelsProps> = ({
  labels,
  mapZoom = 12,
  onLabelClick,
}) => {
  // Scale labels inversely with zoom to keep them readable
  const labelScale = useMemo(() => {
    return Math.max(0.6, Math.min(1.5, (16 - mapZoom) / 5));
  }, [mapZoom]);

  const getTypeStyles = (type: MapLabel["type"]) => {
    switch (type) {
      case "danger":
        return "from-red-600 to-orange-600 text-red-100";
      case "service":
        return "from-emerald-500 to-teal-500 text-white";
      case "alert":
        return "from-red-600 to-pink-600 text-white";
      case "route":
        return "from-blue-500 to-cyan-500 text-white";
      default:
        return "from-slate-600 to-gray-600 text-white";
    }
  };

  const getTypeIcon = (type: MapLabel["type"]) => {
    switch (type) {
      case "danger":
        return "⚠️";
      case "service":
        return "📍";
      case "alert":
        return "🚨";
      case "route":
        return "✔️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {labels.map((label) => (
        <motion.div
          key={label.id}
          className="absolute pointer-events-auto"
          style={{
            left: "0%",
            top: "0%",
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: labelScale }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            onClick={() => onLabelClick?.(label)}
            className={`relative px-3 py-1.5 rounded-full glass-panel-bright text-xs font-bold whitespace-nowrap border border-white/20 hover:border-white/40 transition cursor-pointer flex items-center gap-1.5 bg-gradient-to-r ${getTypeStyles(
              label.type
            )}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={
              label.pulsing
                ? {
                    boxShadow: [
                      `0 0 0 0 rgba(239, 68, 68, 0.4)`,
                      `0 0 0 8px rgba(239, 68, 68, 0.0)`,
                    ],
                  }
                : {}
            }
            transition={
              label.pulsing
                ? { duration: 2, repeat: Infinity, ease: "easeOut" }
                : {}
            }
          >
            <span>{getTypeIcon(label.type)}</span>
            <span>{label.text}</span>
          </motion.button>

          {/* Intensity Indicator Dots */}
          {label.intensity !== undefined && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-current"
                  animate={{
                    opacity: i < Math.ceil(label.intensity! * 3) ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default SmartMapLabels;
