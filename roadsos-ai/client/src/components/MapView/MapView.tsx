"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ParticleSystem } from "@/components/ParticleSystem/ParticleSystem";
import { MapLibreView } from "@/components/MapLibreView/MapLibreView";
import NearbyServicesPanel, { type NearbyService } from "@/components/NearbyServicesPanel/NearbyServicesPanel";

type NearbyPayload = {
  hospitals: Array<{ name: string; distanceKm: number }>;
  ambulances: Array<{ name: string; distanceKm: number; phone: string }>;
  police: Array<{ name: string; distanceKm: number; phone: string }>;
};

type NearbyResponse = {
  ok: boolean;
  nearby: NearbyPayload;
};

type Coords = { lat: number; lng: number };

// Demo accident-prone areas
const DEMO_ACCIDENT_AREAS = [
  { name: "Highway 101 - Rush Hour Bottleneck", distanceKm: 2.3, type: "accident-area" as const },
  { name: "Downtown 5th & Main Intersection", distanceKm: 3.1, type: "accident-area" as const },
  { name: "Freeway Exit 42 - Merge Zone", distanceKm: 4.5, type: "accident-area" as const },
];

function getUserLocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export default function MapView() {
  const [user, setUser] = useState<Coords | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [mode, setMode] = useState<"command" | "emergency" | "watch" | "legal">("command");
  const [loading, setLoading] = useState(false);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);

  const center = { lat: 18.5204, lng: 73.8567 };
  const watchIdRef = React.useRef<number | null>(null);
  const headingWatchRef = React.useRef<number | null>(null);

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
        if (pos.coords.heading !== null) {
          setHeading(pos.coords.heading);
        }
      },
      () => {
        // Silently fail if location updates fail
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // Watch for device heading/orientation
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setHeading(event.alpha);
        }
      };
      window.addEventListener('deviceorientation', handleOrientation);

      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Load nearby services when user location changes
  useEffect(() => {
    if (!user) return;

    const loadNearby = async () => {
      setLoading(true);
      try {
        const response = await axios.post<NearbyResponse>("http://localhost:4000/api/nearby", {
          lat: user.lat,
          lng: user.lng,
          radiusMeters: 5000,
          categories: ["hospitals", "ambulances", "police"],
        });

        if (response.data.ok) {
          const services: NearbyService[] = [];
          
          // Add hospitals
          response.data.nearby.hospitals.forEach(h => {
            services.push({ ...h, type: "hospital" });
          });
          
          // Add ambulances
          response.data.nearby.ambulances.forEach(a => {
            services.push({ ...a, type: "ambulance" });
          });
          
          // Add police
          response.data.nearby.police.forEach(p => {
            services.push({ ...p, type: "police" });
          });
          
          // Add demo fire brigades (in production, fetch from API)
          services.push({
            name: "Central Fire Station",
            distanceKm: 1.8,
            phone: "101",
            type: "fire",
          });
          
          services.push({
            name: "North Brigade Fire Station",
            distanceKm: 3.2,
            phone: "101",
            type: "fire",
          });
          
          // Add accident-prone areas
          services.push(...DEMO_ACCIDENT_AREAS);
          
          setNearbyServices(services);
        }
      } catch {
        // Demo mode - show default services
        const demoServices: NearbyService[] = [
          { name: "Central City Hospital", distanceKm: 1.2, type: "hospital" },
          { name: "Medical Center Clinic", distanceKm: 2.5, type: "hospital" },
          { name: "Emergency Response Unit 1", distanceKm: 0.8, phone: "102", type: "ambulance" },
          { name: "Response Unit 2", distanceKm: 2.1, phone: "102", type: "ambulance" },
          { name: "Main Police Station", distanceKm: 1.5, phone: "100", type: "police" },
          { name: "Downtown Police Precinct", distanceKm: 3.0, phone: "100", type: "police" },
          { name: "Central Fire Station", distanceKm: 1.8, phone: "101", type: "fire" },
          { name: "North Brigade Fire Station", distanceKm: 3.2, phone: "101", type: "fire" },
          ...DEMO_ACCIDENT_AREAS,
        ];
        setNearbyServices(demoServices);
      } finally {
        setLoading(false);
      }
    };

    loadNearby();
  }, [user]);

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">
      {/* Particle system background */}
      <ParticleSystem count={800} emergencyMode={mode === "emergency"} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.2),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_18%),radial-gradient(circle_at_50%_75%,rgba(251,191,36,0.12),transparent_24%)]" />
      <div className="noise-layer" />
      <div className="scanline" />

      {/* Full-screen map */}
      <div className="absolute inset-0 z-0">
        <MapLibreView
          lat={user?.lat ?? center.lat}
          lng={user?.lng ?? center.lng}
          zoom={14}
          onLocationClick={handleLocationClick}
          userLocation={user || undefined}
          accuracy={accuracy}
          heading={heading}
        />
      </div>

      {/* Nearby Services Panel */}
      <NearbyServicesPanel 
        services={nearbyServices}
        loading={loading}
        userLocation={user || undefined}
      />

      {/* Loading badge */}
      <AnimatePresence>{loading ? <LoadingBadge /> : null}</AnimatePresence>
    </div>
  );
}

function LoadingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed left-4 top-4 z-[60] rounded-full border border-cyan-300/20 bg-slate-950/75 px-4 py-2 text-sm font-black text-cyan-100 backdrop-blur-xl"
    >
      Syncing live safety overlays...
    </motion.div>
  );
}
