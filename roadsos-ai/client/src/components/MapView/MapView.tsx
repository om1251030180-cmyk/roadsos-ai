"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MapLibreView } from "@/components/MapLibreView/MapLibreView";

type Coords = { lat: number; lng: number };

function getUserLocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

interface MapViewProps {
  onPointSelect?: (data: any) => void;
}

export default function MapView({ onPointSelect }: MapViewProps) {
  const [user, setUser] = useState<Coords | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);

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

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden text-white" style={{ zIndex: 10 }}>
      {/* Full-screen map */}
      <MapLibreView
        lat={user?.lat ?? center.lat}
        lng={user?.lng ?? center.lng}
        zoom={14}
        onLocationClick={handleLocationClick}
        onPointSelect={onPointSelect}
        userLocation={user || undefined}
        accuracy={accuracy}
        heading={heading}
      />
    </div>
  );
}
