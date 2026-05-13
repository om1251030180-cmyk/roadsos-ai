"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

type Coords = { lat: number; lng: number };
type PointSelection = { lat: number; lng: number };

function getUserLocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

interface MapViewProps {
  onPointSelect?: (data: PointSelection) => void;
}

function MapInteractionLayer({
  onLocationClick,
  onPointSelect,
}: {
  onLocationClick: (lat: number, lng: number) => void;
  onPointSelect?: (data: PointSelection) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onLocationClick(event.latlng.lat, event.latlng.lng);
      onPointSelect?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export default function MapView({ onPointSelect }: MapViewProps) {
  const [user, setUser] = useState<Coords | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);

  const center = { lat: 18.5204, lng: 73.8567 };
  const watchIdRef = React.useRef<number | null>(null);

  // Memoize the click handler to prevent map re-initialization
  const handleLocationClick = useCallback((lat: number, lng: number) => {
    setUser({ lat, lng });
  }, []);

  // Continuous location tracking with watchPosition
  useEffect(() => {
    if (!getUserLocationSupported()) return;

    // First, get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
      },
      () => {
        // Keep demo center if GPS fails
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    // Then watch for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
      },
      () => {
        // Silently fail if location updates fail
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden text-white" style={{ zIndex: 10 }}>
      <MapContainer
        center={[user?.lat ?? center.lat, user?.lng ?? center.lng]}
        zoom={14}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles © <a href="https://www.esri.com/">Esri</a>'
        />

        <MapInteractionLayer onLocationClick={handleLocationClick} onPointSelect={onPointSelect} />

        {user && (
          <>
            <Circle
              center={[user.lat, user.lng]}
              radius={Math.max(accuracy, 30)}
              pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.15, weight: 1 }}
            />
            <CircleMarker
              center={[user.lat, user.lng]}
              radius={8}
              pathOptions={{ color: "#ffffff", fillColor: "#22d3ee", fillOpacity: 1, weight: 2 }}
            />
          </>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
        Satellite map active
      </div>
    </div>
  );
}
