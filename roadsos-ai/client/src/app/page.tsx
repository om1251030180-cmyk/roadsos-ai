"use client";

import MapView from "../components/MapView/MapView";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>
    </main>
  );
}
