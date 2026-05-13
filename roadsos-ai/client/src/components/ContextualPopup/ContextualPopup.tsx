"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";


export type PopupType = "hospital" | "accident" | "road" | "service" | "alert";

export interface PopupData {
  title: string;
  type: PopupType;
  icon: string;
  primaryInfo: Array<{ label: string; value: string; color?: string }>;
  secondaryInfo?: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string; icon: string; onClick: () => void; color?: string }>;
  summary?: string;
  insight?: string;
  accent?: string;
}

export interface ContextualPopupProps {
  data: PopupData | null;
  position?: { x: number; y: number };
  isOpen: boolean;
  onClose?: () => void;
}

/**
 * Apple Maps Style Floating Bubble
 * Replaces the "giant overlay card" with a premium, minimal contextual pill.
 */
export const ContextualPopup: React.FC<ContextualPopupProps> = ({
  data,
  position = { x: 0, y: 0 },
  isOpen,
}) => {
  if (!data) return null;

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: "translate(-50%, -100%)",
    pointerEvents: "auto",
    zIndex: 1000,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          style={popupStyle}
        >
          {/* Apple Maps Style Pill */}
          <div className="glass-ultra rounded-2xl border border-white/20 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-3 cursor-pointer group hover:bg-white/10 transition-colors">
            {/* Icon Circle */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-inner group-hover:scale-105 transition-transform" style={{ color: data.accent }}>
              {data.icon}
            </div>
            
            {/* Content */}
            <div className="pr-4">
              <h4 className="text-sm font-bold text-white whitespace-nowrap">{data.title}</h4>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{data.type}</p>
            </div>

            {/* Little Chevron */}
            <div className="pr-2 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
               </svg>
            </div>
          </div>
          
          {/* Tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/60 border-b border-r border-white/20 rotate-45 backdrop-blur-xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualPopup;
