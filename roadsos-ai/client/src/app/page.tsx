"use client";

import React, { useState } from "react";
import MapView from "../components/MapView/MapView";
import TopBar from "../components/CommandCenter/TopBar";
import LeftDock from "../components/CommandCenter/LeftDock";
import BottomDock from "../components/CommandCenter/BottomDock";
import RightPanel from "../components/CommandCenter/RightPanel";

import dynamic from "next/dynamic";
const CinematicEnvironment = dynamic(
  () => import("../components/CinematicEmergency/CinematicEnvironment"),
  { ssr: false }
);

export default function Home() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  // This would eventually be triggered by Map selections
  const handleSelect = (data: any) => {
    setSelectedData(data);
    setIsPanelOpen(true);
  };

  return (
    <main className="fixed inset-0 min-h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Cinematic Map Layer */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <MapView onPointSelect={handleSelect} />
      </div>

      {/* Atmospheric & Holographic Environment */}
      <CinematicEnvironment />

      {/* UI Shell - Professional Zones */}
      <TopBar />
      <LeftDock />
      <RightPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        data={selectedData} 
      />
      <BottomDock />
      
      {/* Noise Layer for premium texture */}
      <div className="noise-layer z-[1000]" />
    </main>
  );
}
