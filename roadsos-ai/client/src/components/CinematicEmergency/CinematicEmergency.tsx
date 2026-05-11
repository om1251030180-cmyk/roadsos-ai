"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type EmergencyLevel = "normal" | "warning" | "critical";

interface EmergencyDashboard {
  nearestAmbulance: { name: string; distance: number; eta: number; phone: string };
  nearestHospital: { name: string; distance: number; beds: number };
  emergencyContacts: Array<{ type: string; number: string }>;
  firstAid: string;
}

async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

interface CinematicEmergencyProps {
  compact?: boolean;
  dockMode?: boolean;
  triggerClassName?: string;
  panelClassName?: string;
}

export default function CinematicEmergencySystem({
  compact = false,
  dockMode = false,
  triggerClassName = "",
  panelClassName = "",
}: CinematicEmergencyProps) {
  const [isActive, setIsActive] = useState(false);
  const [level, setLevel] = useState<EmergencyLevel>("normal");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<EmergencyDashboard | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isActive]);

  const activateEmergency = async () => {
    if (isActive) {
      setIsActive(false);
      setLevel("normal");
      setCountdown(0);
      return;
    }

    setLoading(true);
    setIsActive(true);
    setLevel("critical");
    setCountdown(5);

    try {
      const coords = await getCurrentLocation();
      const response = await axios.post<any>("http://localhost:4000/api/sos", {
        lat: coords.lat,
        lng: coords.lng,
        message: "Emergency SOS activated",
        language: "en",
      });

      if (response.data?.ok) {
        setDashboard({
          nearestAmbulance: response.data.nearby.ambulances?.[0] || {
            name: "Ambulance Unit 1",
            distance: 1.2,
            eta: 4,
            phone: "102",
          },
          nearestHospital: response.data.nearby.hospitals?.[0] || {
            name: "City Central Hospital",
            distance: 2.5,
            beds: 12,
          },
          emergencyContacts: response.data.emergencyContacts || [
            { type: "Ambulance", number: "102" },
            { type: "Police", number: "100" },
            { type: "Fire", number: "101" },
          ],
          firstAid: response.data.firstAid || "Stay calm. Ensure safety. Call emergency services immediately.",
        });
      }
    } catch (error) {
      console.error("Emergency activation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Emergency Button - Cinematic Design */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={activateEmergency}
        className={`${dockMode ? "relative" : "fixed bottom-6 left-6 z-[70]"} ${compact ? "w-14 h-14" : "w-24 h-24"} rounded-2xl font-black text-white border-2 pointer-events-auto transition-all duration-300 ${triggerClassName} ${
          isActive
            ? "bg-gradient-to-br from-red-600 to-red-700 border-red-400 emergency-pulse shadow-red-500/50"
            : "bg-gradient-to-br from-rose-600 to-red-700 border-red-400/50 hover:shadow-lg shadow-lg"
        }`}
        style={{
          boxShadow: isActive
            ? "0 0 60px rgba(239, 68, 68, 0.6), inset 0 2px 20px rgba(255, 255, 255, 0.1)"
            : "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className="text-3xl mb-1">🆘</div>
          <div className="text-xs font-bold uppercase tracking-wider">{isActive ? "Active" : "SOS"}</div>
          {isActive && <div className="text-[10px] mt-1">–{countdown}</div>}
        </div>
      </motion.button>

      {/* Cinematic Full-Screen Overlay - Emergency Activated */}
      <AnimatePresence>
        {isActive && (
          <>
            {/* Screen Pulse Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="fixed inset-0 bg-red-600 z-[60] pointer-events-none"
            />

            {/* Emergency Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className={`fixed bottom-32 left-6 z-[70] ${compact ? "w-[min(24rem,calc(100vw-1.5rem))]" : "w-96"} pointer-events-auto ${panelClassName}`}
            >
                <div className="rounded-[28px] glass-ultra border border-red-400/30 overflow-hidden shadow-2xl">
                {/* Critical Alert Header */}
                <div className="bg-gradient-to-r from-red-600/40 to-orange-600/40 border-b border-red-400/30 px-6 py-5">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex items-center gap-3 mb-2"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <h2 className="text-2xl font-black text-red-100">EMERGENCY ACTIVE</h2>
                  </motion.div>
                  <p className="text-sm text-red-100/70">Emergency services have been notified</p>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-3" />
                      <p className="text-white/70">Routing emergency services...</p>
                    </div>
                  ) : dashboard ? (
                    <>
                      {/* Nearest Ambulance - Highlight */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 border border-emerald-400/40 rounded-[24px] p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-emerald-200/70 uppercase font-bold tracking-widest">Nearest Ambulance</p>
                            <p className="text-xl font-black text-white mt-1">{dashboard.nearestAmbulance.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-emerald-300">{dashboard.nearestAmbulance.eta}m</p>
                            <p className="text-xs text-emerald-200/70">ETA</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-white/50">Distance</p>
                            <p className="text-lg font-bold text-white">{dashboard.nearestAmbulance.distance.toFixed(1)}km</p>
                          </div>
                          <button
                            onClick={() => window.location.href = `tel:${dashboard.nearestAmbulance.phone}`}
                            className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg py-2 font-bold text-sm transition"
                          >
                            📞 Call
                          </button>
                        </div>
                      </motion.div>

                      {/* Nearest Hospital */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-[24px] p-4"
                      >
                        <p className="text-xs text-blue-200/70 uppercase font-bold tracking-widest">Nearest Hospital</p>
                        <p className="text-lg font-black text-white mt-1">{dashboard.nearestHospital.name}</p>
                        <div className="mt-3 flex gap-4">
                          <div>
                            <p className="text-xs text-white/50">Distance</p>
                            <p className="text-xl font-bold text-white">{dashboard.nearestHospital.distance.toFixed(1)}km</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/50">Beds Available</p>
                            <p className="text-xl font-bold text-white">{dashboard.nearestHospital.beds}</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* First Aid Info */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-400/30 rounded-[24px] p-4"
                      >
                        <p className="text-xs text-amber-200/70 uppercase font-bold tracking-widest">⚡ Immediate Action</p>
                        <p className="text-sm text-white/90 mt-2">{dashboard.firstAid}</p>
                      </motion.div>

                      {/* Emergency Contacts Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {dashboard.emergencyContacts.map((contact, idx) => (
                          <motion.button
                            key={`${contact.type}-${contact.number}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            onClick={() => window.location.href = `tel:${contact.number}`}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-center transition"
                          >
                            <p className="text-xs text-white/60">{contact.type}</p>
                            <p className="text-sm font-bold text-white">{contact.number}</p>
                          </motion.button>
                        ))}
                      </div>

                      {/* Cancel Emergency */}
                      <button
                        onClick={activateEmergency}
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-2 font-bold text-sm transition mt-2"
                      >
                        Deactivate Emergency
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
