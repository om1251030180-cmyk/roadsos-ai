"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type NearbyService = {
  name: string;
  distanceKm: number;
  phone?: string;
  type: "hospital" | "ambulance" | "police" | "fire" | "accident-area";
};

interface NearbyServicesPanelProps {
  services: NearbyService[];
  loading?: boolean;
  userLocation?: { lat: number; lng: number };
}

const serviceIcons = {
  hospital: "🏥",
  ambulance: "🚑",
  police: "🚨",
  fire: "🚒",
  "accident-area": "⚠️",
};

const serviceColors = {
  hospital: "from-blue-500 to-cyan-500",
  ambulance: "from-emerald-500 to-teal-500",
  police: "from-red-500 to-orange-500",
  fire: "from-yellow-500 to-orange-500",
  "accident-area": "from-yellow-600 to-red-600",
};

export default function NearbyServicesPanel({
  services,
  loading = false,
  userLocation,
}: NearbyServicesPanelProps) {
  const [selectedService, setSelectedService] = useState<NearbyService | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("hospital");

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.type]) acc[service.type] = [];
    acc[service.type].push(service);
    return acc;
  }, {} as Record<string, NearbyService[]>);

  const categoryLabels: Record<string, string> = {
    hospital: "Hospitals",
    ambulance: "Ambulances",
    police: "Police Stations",
    fire: "Fire Brigades",
    "accident-area": "Accident-Prone Areas",
  };

  return (
    <>
      {/* Main Services Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-32 max-w-xs pointer-events-auto z-40 max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        <div className="space-y-2">
          {Object.entries(groupedServices).map(([category, items]) => (
            <motion.div
              key={category}
              className="glass-panel-bright rounded-xl overflow-hidden border border-white/10"
              whileHover={{ scale: 1.02 }}
            >
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category ? null : category
                  )
                }
                className={`w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r ${
                  serviceColors[category as keyof typeof serviceColors]
                } hover:opacity-90 transition`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {serviceIcons[category as keyof typeof serviceIcons]}
                  </span>
                  <span className="font-bold text-sm text-white">
                    {categoryLabels[category]} ({items.length})
                  </span>
                </div>
                <span className="text-xl">
                  {expandedCategory === category ? "▼" : "▶"}
                </span>
              </button>

              {/* Services List */}
              <AnimatePresence>
                {expandedCategory === category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-black/50 border-t border-white/10"
                  >
                    <div className="space-y-2 p-3">
                      {items.map((service, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setSelectedService(service)}
                          whileHover={{ x: 5 }}
                          className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/20"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-xs text-white truncate">
                                {service.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-cyan-300">
                                  📍 {service.distanceKm.toFixed(2)} km
                                </span>
                                {service.phone && (
                                  <span className="text-xs text-emerald-300">
                                    📞 {service.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-lg">→</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {loading && (
            <div className="glass-panel-bright rounded-xl p-4 flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              <span className="ml-2 text-xs text-white/70">Loading services...</span>
            </div>
          )}

          {!loading && services.length === 0 && (
            <div className="glass-panel-bright rounded-xl p-4 text-center">
              <p className="text-xs text-white/60">No services found nearby</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detailed Service Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`glass-panel-bright rounded-2xl p-6 max-w-sm border border-white/20 bg-gradient-to-br ${
                serviceColors[selectedService.type]
              } shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {serviceIcons[selectedService.type]}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {selectedService.name}
                    </h3>
                    <p className="text-xs text-white/70 capitalize">
                      {categoryLabels[selectedService.type] ||
                        selectedService.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-2xl text-white/60 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-white/60">Distance</p>
                    <p className="font-semibold text-white">
                      {selectedService.distanceKm.toFixed(2)} km away
                    </p>
                  </div>
                </div>

                {selectedService.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <div>
                      <p className="text-xs text-white/60">Emergency Contact</p>
                      <p className="font-semibold text-white">
                        {selectedService.phone}
                      </p>
                    </div>
                  </div>
                )}

                {userLocation && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📌</span>
                    <div>
                      <p className="text-xs text-white/60">Your Location</p>
                      <p className="font-semibold text-white text-xs">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition border border-white/30">
                  📍 Navigate
                </button>
                {selectedService.phone && (
                  <button className="bg-green-500/30 hover:bg-green-500/50 text-white font-bold py-2 px-4 rounded-lg transition border border-green-400/30">
                    📞 Call
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
