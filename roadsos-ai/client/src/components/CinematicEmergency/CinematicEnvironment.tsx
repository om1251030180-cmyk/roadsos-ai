"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * CinematicEnvironment adds the final layer of futuristic "Living City" atmosphere.
 * - Ambient floating particles
 * - Periodic holographic scan waves
 * - Dynamic lighting vignettes
 */
export const CinematicEnvironment: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ x: string; y: string; duration: number; delay: number }>>([]);

  useEffect(() => {
    const list = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100 + "vw",
      y: Math.random() * 100 + "vh",
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 20,
    }));
    setParticles(list);
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Ambient Particles */}
      {mounted && particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full blur-[1px]"
          initial={{ x: p.x, y: p.y, opacity: 0 }}
          animate={{ y: [null, "-20vh"], opacity: [0, 0.4, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
        />
      ))}

      {/* Holographic Scan Wave */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[40vh] w-full"
        animate={{ 
          top: ["-100%", "200%"] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        style={{ filter: 'blur(40px)', mixBlendMode: 'overlay' }}
      />

      {/* Radial Vignette for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.4)_100%)]" />
      
      {/* HUD-like corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-white/5 m-8 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/5 m-8 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-white/5 m-8 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-white/5 m-8 rounded-br-3xl" />
    </div>
  );
};

export default CinematicEnvironment;
