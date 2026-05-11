"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import MapView from "../components/MapView/MapView";
import CinematicEmergency from "../components/CinematicEmergency/CinematicEmergency";
import SmartCityOverlays from "../components/SmartCityOverlays/SmartCityOverlays";
import { MapLayerManager, type MapLayer } from "@/components/MapLayerManager/MapLayerManager";
import { ContextualPopup, type PopupData } from "@/components/ContextualPopup/ContextualPopup";
import { CompactAssistant } from "@/components/CompactAssistant/CompactAssistant";
import { SmartMapLabels, type MapLabel } from "@/components/SmartMapLabels/SmartMapLabels";

/**
 * Spatial interface shell.
 *
 * The map remains the hero surface while all controls are organized into
 * clear zones: top bar, left dock, right context rail, and bottom dock.
 */
export default function Home() {
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(["hospitals", "ambulances", "police"]);
  const [selectedPopup, setSelectedPopup] = useState<PopupData | null>(null);
  const [popupPosition] = useState({ x: 0, y: 0 });
  const [searchValue, setSearchValue] = useState("");

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
      prev.includes(layer) ? prev.filter((item) => item !== layer) : [...prev, layer]
    );
  }, []);

  const topMetrics = useMemo(
    () => [
      { label: "City", value: "Pune Metro" },
      { label: "Weather", value: "28°C Clear" },
      { label: "Response", value: "3.4m avg" },
      { label: "Coverage", value: "92%" },
    ],
    []
  );

  const quickSearchTags = ["Hospitals", "Accidents", "Traffic", "Safe routes"];

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(168,85,247,0.08),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.48),transparent_68%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,11,0.12),rgba(2,5,11,0.55))]" />

      <div className="absolute inset-0 z-0 map-breathe">
        <MapView />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <SmartMapLabels
          labels={mapLabels}
          mapZoom={12}
          onLabelClick={(label) => console.log("Label clicked:", label.id)}
        />
      </div>

      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="noise-layer" />
        <div className="scanline" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 spatial-shell map-hero-frame px-3 sm:px-4 lg:px-6">
        <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-3">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-auto mx-auto w-full max-w-[1180px]"
          >
            <div className="dock-surface flex flex-col gap-3 rounded-[28px] border border-white/10 px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25">
                    RS
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/70">RoadSoS AI</p>
                    <p className="text-sm text-white/80">Spatial emergency intelligence for smart cities</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 lg:max-w-[620px]">
                  <span className="text-white/45">⌕</span>
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search hospitals, incidents, routes, or city zones"
                    className="h-8 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                  />
                  <span className="hidden rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/80 sm:inline-flex">
                    Quick AI
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {topMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70"
                    >
                      <span className="mr-2 text-white/45">{metric.label}</span>
                      <span className="font-semibold text-white">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
                    onClick={() => setSearchValue(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.header>

          <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(250px,290px)_minmax(0,1fr)_minmax(290px,340px)]">
            <aside className="pointer-events-auto flex h-full flex-col gap-3">
              <div className="dock-surface rounded-[28px] border border-white/10 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">Left Dock</p>
                <p className="mt-1 text-sm text-white/70">Layers, filters, and service clusters stay docked here.</p>
              </div>
              <MapLayerManager activeLayers={activeLayers} onLayerToggle={handleLayerToggle} compact dockMode />
            </aside>

            <div className="hidden lg:block" />

            <aside className="pointer-events-auto flex h-full flex-col gap-3">
              <div className="dock-surface rounded-[28px] border border-white/10 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-200/70">Context Rail</p>
                <p className="mt-1 text-sm text-white/70">Selected markers and intelligence summaries appear here.</p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,30,0.9),rgba(3,8,18,0.72))] p-4 backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">Live Status</p>
                    <h2 className="mt-1 text-lg font-black text-white">Map Priority Stack</h2>
                  </div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">
                    Connected
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>Map visibility</span>
                    <span className="font-semibold text-cyan-200">Primary</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>Widget density</span>
                    <span className="font-semibold text-emerald-200">Low</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>Overlay mode</span>
                    <span className="font-semibold text-fuchsia-200">Contextual</span>
                  </div>
                </div>
              </div>

              {selectedPopup ? (
                <div className="dock-surface rounded-[28px] border border-white/10 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/70">Selected Location</p>
                  <h3 className="mt-2 text-xl font-black text-white">{selectedPopup.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{selectedPopup.type.toUpperCase()} intelligence is now in focus.</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {selectedPopup.primaryInfo.slice(0, 4).map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{item.label}</p>
                        <p className={`mt-1 font-black ${item.color || "text-white"}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {selectedPopup.actions?.slice(0, 2).map((action) => (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        className={`flex-1 rounded-2xl px-3 py-2 text-xs font-black transition ${action.color || "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"}`}
                      >
                        {action.icon} {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <SmartCityOverlays dockMode />
            </aside>
          </div>

          <div className="pointer-events-auto mx-auto flex w-full max-w-[760px] items-end justify-center gap-3 pb-1">
            <div className="dock-surface flex w-full items-center justify-between gap-2 rounded-[30px] border border-white/10 px-3 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-4">
              <div className="flex items-center gap-2">
                <CompactAssistant dockMode />
                <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white/80 transition hover:border-cyan-300/30 hover:bg-cyan-300/10">
                  🎙️
                </button>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10">
                  ⟲ Recenter
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10">
                  🧭 Routes
                </button>
              </div>

              <div className="flex items-center gap-2">
                <CinematicEmergency compact dockMode />
                <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-emerald-400/10 text-xl text-emerald-100 transition hover:border-emerald-300/30 hover:bg-emerald-300/15">
                  📍
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContextualPopup
        data={selectedPopup}
        position={popupPosition}
        isOpen={selectedPopup !== null}
        onClose={() => setSelectedPopup(null)}
      />
    </main>
  );
}
