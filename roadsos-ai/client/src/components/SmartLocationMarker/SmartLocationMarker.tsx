"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface SmartLocationMarkerProps {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  isActive?: boolean;
}

/**
 * Apple Maps-style animated location marker with:
 * - Glowing blue orb
 * - Soft radial animation
 * - Pulse effect
 * - Direction cone
 * - Accuracy radius indicator
 * - Live ripple pulse
 */
export const SmartLocationMarker: React.FC<SmartLocationMarkerProps> = ({
  lat,
  lng,
  accuracy = 10,
  heading = 0,
  isActive = true,
}) => {
  const markerElement = useMemo(
    () => (
      <div className="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2">
        {/* Accuracy Radius - Animated Glow Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400/30"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(96, 165, 250, 0.3)",
              "0 0 0 8px rgba(96, 165, 250, 0.1)",
              "0 0 0 0 rgba(96, 165, 250, 0.0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Accuracy Circle - Outer Halo */}
        <motion.div
          className="absolute inset-0 rounded-full border border-blue-300/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle Glow Ring */}
        <motion.div
          className="absolute inset-1 rounded-full border border-cyan-400/40"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Main Orb - Core Location Marker */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0 rgba(34, 211, 238, 0.6)",
              "0 0 0 12px rgba(59, 130, 246, 0.3)",
              "0 0 0 0 rgba(34, 211, 238, 0)",
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Direction Indicator - Arrow pointing to heading */}
        {heading !== undefined && (
          <motion.div
            className="absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-b from-cyan-300 to-transparent rounded-full"
            style={{
              transform: `translate(-50%, -50%) rotateZ(${heading}deg) translateY(-6px)`,
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Accuracy Indicator Text */}
        {accuracy && accuracy > 0 && (
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-cyan-300/70 font-mono whitespace-nowrap"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ±{Math.round(accuracy)}m
          </motion.div>
        )}
      </div>
    ),
    [accuracy, heading]
  );

  return markerElement;
};

export default SmartLocationMarker;
