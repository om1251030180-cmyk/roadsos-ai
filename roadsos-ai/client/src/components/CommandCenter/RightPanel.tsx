"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

export const RightPanel: React.FC<RightPanelProps> = ({ isOpen, onClose, data }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-[1001] w-80 h-[70vh] pointer-events-none"
        >
          <div className="dock-surface w-full h-full rounded-3xl p-6 pointer-events-auto border border-white/10 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl">
                  {data?.icon || "📍"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white/90 leading-tight">{data?.title || "Location Details"}</h3>
                  <p className="text-[10px] font-medium text-cyan-400 uppercase tracking-widest">{data?.category || "Context"}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
               {/* Metrics Grid */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">ETA</p>
                    <p className="text-sm font-bold">12 mins</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">Safety</p>
                    <p className="text-sm font-bold text-emerald-400">98%</p>
                  </div>
               </div>

               {/* AI Insight Section */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🧠</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">AI Intelligence</span>
                  </div>
                  <div className="glass-panel-bright rounded-2xl p-4 border border-cyan-400/20">
                    <p className="text-xs text-white/80 leading-relaxed italic">
                      "Traffic flow is currently optimal. AI recommends this facility based on bed availability and trauma support rating."
                    </p>
                  </div>
               </div>

               {/* Actions */}
               <div className="space-y-2 pt-4">
                  <button className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    Navigate Now
                  </button>
                  <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition">
                    Call Facility
                  </button>
               </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                <span>Coord: 18.5204, 73.8567</span>
                <span>ID: SOS-9921</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightPanel;
