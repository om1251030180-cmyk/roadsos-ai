"use client";

import React, { useState, useCallback } from "react";
import MapView from "../components/MapView/MapView";
import CinematicEmergency from "../components/CinematicEmergency/CinematicEmergency";
import SmartCityOverlays from "../components/SmartCityOverlays/SmartCityOverlays";
import { motion } from "framer-motion";
import { MapLayerManager, type MapLayer } from "@/components/MapLayerManager/MapLayerManager";
import { ContextualPopup, type PopupData } from "@/components/ContextualPopup/ContextualPopup";
import { FloatingMiniControls } from "@/components/FloatingMiniControls/FloatingMiniControls";
import { CompactAssistant } from "@/components/CompactAssistant/CompactAssistant";
import { SmartMapLabels, type MapLabel } from "@/components/SmartMapLabels/SmartMapLabels";

/**
 * MAP-FIRST REDESIGN
 * 
 * The map is now the PRIMARY interactive system, not the background.
 * All information is embedded into the map through:
 * - Intelligent markers and overlays
 * - Contextual popups (not large cards)
 * - Smart floating labels
 * - Animated data visualization
 * - Floating mini controls (auto-hide)
 * - Compact AI assistant orb
 * 
 * The city feels alive through dynamic layers, glow effects, and flowing animations.
 */
export default function Home() {
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(["hospitals", "ambulances", "police"]);
  const [selectedPopup, setSelectedPopup] = useState<PopupData | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [mapLabels] = useState<MapLabel[]>([
    {
      id: "danger-zone-1",
      text: "High Accident Zone",
      lat: 18.52,
      lng: 73.85,
      type: "danger",
      intensity: 0.9,
      pulsing: true,
    },
    {
      id: "hospital-1",
      text: "Trauma Center",
      lat: 18.53,
      lng: 73.86,
      type: "service",
      intensity: 0.7,
    },
    {
      id: "construction-1",
      text: "Road Construction",
      lat: 18.51,
      lng: 73.84,
      type: "alert",
      intensity: 0.6,
    },
  ]);

  const handleLayerToggle = useCallback((layer: MapLayer) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  }, []);

  const handleMapMarkerClick = useCallback((markerData: any) => {
    const popup: PopupData = {
      title: markerData.name,
      type: markerData.type,
      icon: markerData.icon,
      primaryInfo: [
        { label: "Distance", value: markerData.distance, color: "text-cyan-300" },
        { label: "ETA", value: markerData.eta || "N/A", color: "text-emerald-300" },
        { label: "Status", value: markerData.status || "Open", color: "text-green-300" },
        { label: "Rating", value: markerData.rating || "4.8/5", color: "text-amber-300" },
      ],
      secondaryInfo: [
        { label: "Phone", value: markerData.phone || "Available" },
        { label: "Services", value: markerData.services || "24/7 Emergency" },
      ],
      actions: [
        {
          label: "Navigate",
          icon: "🗺️",
          onClick: () => console.log("Navigate to", markerData.name),
          color: "bg-blue-500/40 hover:bg-blue-500/60 text-blue-100 border border-blue-400/30",
        },
        {
          label: "Call",
          icon: "📞",
          onClick: () => console.log("Call", markerData.phone),
          color: "bg-green-500/40 hover:bg-green-500/60 text-green-100 border border-green-400/30",
        },
      ],
      distance: parseFloat(markerData.distance),
      eta: 3.2,
    };
    setSelectedPopup(popup);
  }, []);

  const miniControls = [
    {
      id: "locate",
      icon: "📍",
      label: "Find Me",
      onClick: () => console.log("Locate user"),
    },
    {
      id: "emergency",
      icon: "🚨",
      label: "Emergency",
      onClick: () => console.log("Emergency mode"),
    },
    {
      id: "traffic",
      icon: "🚦",
      label: "Traffic",
      onClick: () => console.log("Toggle traffic"),
    },
    {
      id: "settings",
      icon: "⚙️",
      label: "Settings",
      onClick: () => console.log("Open settings"),
    },
  ];

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.05),transparent_50%)]" />

      {/* Fullscreen Map - PRIMARY ELEMENT */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* Smart Map Labels - Embedded in Map */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <SmartMapLabels
          labels={mapLabels}
          mapZoom={12}
          onLabelClick={(label) =>
            console.log("Label clicked:", label.id)
          }
        />
      </div>

      {/* Cinematic Effects Layer */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <div className="noise-layer" />
        <div className="scanline" />
      </div>

      {/* Smart City Overlay System - Subtle */}
      <SmartCityOverlays />

      {/* Emergency System - Top Priority */}
      <CinematicEmergency />

      {/* MAP-FIRST UI LAYER */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Compact Top-Left Brand Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-6 left-6 pointer-events-auto"
        >
          <div className="glass-panel rounded-2xl px-5 py-3 backdrop-blur-xl border border-white/10 max-w-fit">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70 font-black">RoadSoS</p>
                <p className="text-xs text-white/60">Smart City AI</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Compact Network Status - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-6 pointer-events-auto"
        >
          <div className="glass-panel rounded-lg px-4 py-2 backdrop-blur-xl border border-white/10 text-xs flex items-center gap-2">
            <span className="text-xl">🛰️</span>
            <span className="text-white/70">Connected • AI Ready</span>
          </div>
        </motion.div>

        {/* Info Card - Bottom Left - Minimal Live Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-32 left-6 pointer-events-auto"
        >
          <div className="glass-panel rounded-2xl p-4 backdrop-blur-xl border border-white/10 max-w-xs">
            <p className="text-xs uppercase tracking-[0.1em] text-cyan-300 font-black mb-3">
              Live City Intelligence
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <p className="text-white/60 font-bold">Incidents</p>
                <p className="text-lg font-black text-red-300 mt-1">07</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <p className="text-white/60 font-bold">Avg Response</p>
                <p className="text-lg font-black text-emerald-300 mt-1">3.4m</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <p className="text-white/60 font-bold">Coverage</p>
                <p className="text-lg font-black text-cyan-300 mt-1">92%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <p className="text-white/60 font-bold">Network</p>
                <p className="text-lg font-black text-purple-300 mt-1">5G+</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contextual Popup - Appears on Map Marker Click */}
      <ContextualPopup
        data={selectedPopup}
        position={popupPosition}
        isOpen={selectedPopup !== null}
        onClose={() => setSelectedPopup(null)}
      />

      {/* Map Layer Manager - Bottom Right */}
      <MapLayerManager
        activeLayers={activeLayers}
        onLayerToggle={handleLayerToggle}
        compact={true}
      />

      {/* Floating Mini Controls - Top Right Corner */}
      <FloatingMiniControls
        controls={miniControls}
        position="top-right"
        autoHide={true}
        hideDelay={4000}
      />

      {/* Compact AI Assistant Orb - Draggable */}
      <CompactAssistant />
    </main>
  );
}
