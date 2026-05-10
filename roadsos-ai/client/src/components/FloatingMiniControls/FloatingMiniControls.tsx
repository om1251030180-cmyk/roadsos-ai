"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ControlItem {
  id: string;
  icon: string;
  label: string;
  color?: string;
  onClick: () => void;
}

interface FloatingMiniControlsProps {
  controls: ControlItem[];
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  autoHide?: boolean;
  hideDelay?: number;
}

/**
 * Compact floating controls that auto-hide when inactive
 * Features:
 * - Minimal footprint
 * - Glassmorphism design
 * - Smooth animations
 * - Auto-hide functionality
 * - Expandable menu
 * - Icon-first UI
 */
export const FloatingMiniControls: React.FC<FloatingMiniControlsProps> = ({
  controls,
  position = "top-left",
  autoHide = true,
  hideDelay = 3000,
}) => {
  const [isExpanded, setIsExpanded] = useState(!autoHide);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    if (!autoHide || isHovered || isExpanded) return;

    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, hideDelay);

    return () => clearTimeout(timer);
  }, [autoHide, hideDelay, isHovered, isExpanded]);

  const positionClasses: Record<string, string> = {
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
  };

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-40 pointer-events-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Button */}
      {!isExpanded && (
        <motion.button
          onClick={() => setIsExpanded(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border border-cyan-300/50 backdrop-blur-xl hover:from-cyan-500/60 hover:to-blue-500/60 transition flex items-center justify-center text-lg font-black shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ⚙️
        </motion.button>
      )}

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* Controls Grid */}
            <div className="glass-panel-bright rounded-2xl p-3 backdrop-blur-xl border border-white/10">
              <div className="grid grid-cols-2 gap-2">
                {controls.map((control) => (
                  <motion.button
                    key={control.id}
                    onClick={() => {
                      control.onClick();
                      if (autoHide) setIsExpanded(false);
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition ${
                      control.color ||
                      "bg-white/10 hover:bg-white/20 border border-white/20"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={control.label}
                  >
                    {control.icon}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={() => setIsExpanded(false)}
              className="w-full px-3 py-2 text-xs font-bold text-white/70 hover:text-white transition rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
              whileHover={{ scale: 1.02 }}
            >
              Close ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingMiniControls;
