"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export type PopupType = "hospital" | "accident" | "road" | "service" | "alert";

export interface PopupData {
  title: string;
  type: PopupType;
  icon: string;
  primaryInfo: Array<{ label: string; value: string; color?: string }>;
  secondaryInfo?: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string; icon: string; onClick: () => void; color?: string }>;
  distance?: number;
  eta?: number;
}

interface ContextualPopupProps {
  data: PopupData | null;
  position?: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (actionIndex: number) => void;
}

const popupIcons: Record<PopupType, string> = {
  hospital: "🏥",
  accident: "⚠️",
  road: "🛣️",
  service: "📍",
  alert: "🚨",
};

/**
 * Contextual popup that appears on demand near map markers
 * Replaces large floating cards
 * Features:
 * - Glassmorphism design
 * - Smooth animations
 * - Quick action buttons
 * - Smart positioning
 * - Blur effects
 * - Floating shadow
 */
export const ContextualPopup: React.FC<ContextualPopupProps> = ({
  data,
  position = { x: 0, y: 0 },
  isOpen,
  onClose,
  onActionClick,
}) => {
  if (!data) return null;

  const getTypeGradient = (type: PopupType): string => {
    switch (type) {
      case "hospital":
        return "from-blue-500 to-cyan-500";
      case "accident":
        return "from-red-500 to-orange-500";
      case "road":
        return "from-amber-500 to-yellow-500";
      case "service":
        return "from-emerald-500 to-teal-500";
      case "alert":
        return "from-red-600 to-pink-600";
      default:
        return "from-purple-500 to-pink-500";
    }
  };

  const getTypeColor = (type: PopupType): string => {
    switch (type) {
      case "hospital":
        return "text-cyan-300";
      case "accident":
        return "text-orange-300";
      case "road":
        return "text-amber-300";
      case "service":
        return "text-emerald-300";
      case "alert":
        return "text-red-300";
      default:
        return "text-purple-300";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && data && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 pointer-events-auto"
          />

          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 50,
            }}
            className="pointer-events-auto"
          >
            <div className="relative w-72">
              {/* Popup Card */}
              <div className="glass-panel-bright rounded-2xl overflow-hidden shadow-2xl">
                {/* Header with Color Band */}
                <div
                  className={`bg-gradient-to-r ${getTypeGradient(
                    data.type
                  )} p-4 relative`}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{data.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-white leading-tight">
                          {data.title}
                        </h3>
                        {data.distance && (
                          <p className="text-xs text-white/70 mt-1">
                            {data.distance.toFixed(1)} km away
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/70 hover:text-white transition text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Primary Info Grid */}
                <div className="p-4 border-b border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    {data.primaryInfo.map((info, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-2 transition"
                        whileHover={{ scale: 1.05 }}
                      >
                        <p className="text-xs text-white/60 font-bold uppercase tracking-[0.1em]">
                          {info.label}
                        </p>
                        <p
                          className={`text-lg font-black mt-1 ${
                            info.color || "text-cyan-300"
                          }`}
                        >
                          {info.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Secondary Info */}
                {data.secondaryInfo && data.secondaryInfo.length > 0 && (
                  <div className="px-4 py-3 border-b border-white/10 space-y-2">
                    {data.secondaryInfo.map((info, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-xs text-white/60">{info.label}</span>
                        <span className="text-sm font-bold text-white/80">
                          {info.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {data.actions && data.actions.length > 0 && (
                  <div className="p-4 space-y-2">
                    {data.actions.map((action, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          action.onClick();
                          onActionClick?.(idx);
                        }}
                        className={`w-full px-4 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                          action.color ||
                          "bg-gradient-to-r from-cyan-500/40 to-blue-500/40 hover:from-cyan-500/60 hover:to-blue-500/60 text-cyan-100 border border-cyan-400/30"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{action.icon}</span>
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Tail/Arrow pointing down */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-0.5">
                  <div
                    className="w-4 h-3 bg-gradient-to-b"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(8, 15, 33, 0.86), transparent)`,
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContextualPopup;
