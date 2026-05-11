'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreViewProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  onLocationClick?: (lat: number, lng: number) => void;
  userLocation?: { lat: number; lng: number };
  accuracy?: number;
  heading?: number;
}

type SafetyCategory = "hospital" | "ambulance" | "police" | "danger" | "construction" | "crowd";

type SafetyFeature = {
  id: string;
  category: SafetyCategory;
  title: string;
  subtitle: string;
  level: "low" | "medium" | "high";
  icon: string;
  lon: number;
  lat: number;
};

// Helper function to create a circle GeoJSON for accuracy radius
const createCircleGeoJSON = (lon: number, lat: number, radiusKm: number) => {
  const numberOfPoints = 64;
  const points = [];

  for (let i = 0; i < numberOfPoints; i++) {
    const angle = (i / numberOfPoints) * (2 * Math.PI);
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const latOffset = dy / 111; // 1 degree latitude = ~111 km
    const lonOffset = dx / (111 * Math.cos((lat * Math.PI) / 180)); // adjusted for latitude
    points.push([lon + lonOffset, lat + latOffset]);
  }
  points.push(points[0]); // Close the circle

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [points],
        },
        properties: {},
      },
    ],
  };
};

const createSafetyFeatures = (anchorLat: number, anchorLng: number): GeoJSON.FeatureCollection<GeoJSON.Point, SafetyFeature> => {
  const points: Array<Omit<SafetyFeature, "id" | "lon" | "lat"> & { id: string; lonOffset: number; latOffset: number }> = [
    {
      id: "hospital-1",
      category: "hospital",
      title: "Central Trauma Center",
      subtitle: "24/7 emergency care",
      level: "high",
      icon: "🏥",
      lonOffset: 0.008,
      latOffset: 0.006,
    },
    {
      id: "hospital-2",
      category: "hospital",
      title: "City Hospital",
      subtitle: "ICU and ER available",
      level: "medium",
      icon: "🏥",
      lonOffset: -0.01,
      latOffset: 0.004,
    },
    {
      id: "ambulance-1",
      category: "ambulance",
      title: "Ambulance Unit 112",
      subtitle: "Fast response nearby",
      level: "high",
      icon: "🚑",
      lonOffset: 0.004,
      latOffset: -0.004,
    },
    {
      id: "police-1",
      category: "police",
      title: "Police Control Room",
      subtitle: "Traffic and safety response",
      level: "medium",
      icon: "🚨",
      lonOffset: -0.007,
      latOffset: -0.006,
    },
    {
      id: "danger-1",
      category: "danger",
      title: "High Accident Zone",
      subtitle: "Sharp curve + low visibility",
      level: "high",
      icon: "⚠️",
      lonOffset: 0.015,
      latOffset: 0.002,
    },
    {
      id: "danger-2",
      category: "danger",
      title: "Night Risk Stretch",
      subtitle: "Poor lighting and crossings",
      level: "medium",
      icon: "⚠️",
      lonOffset: -0.014,
      latOffset: 0.012,
    },
    {
      id: "construction-1",
      category: "construction",
      title: "Road Work Ahead",
      subtitle: "Lane narrowing and diversions",
      level: "medium",
      icon: "🏗️",
      lonOffset: 0.018,
      latOffset: -0.01,
    },
    {
      id: "crowd-1",
      category: "crowd",
      title: "Congested Junction",
      subtitle: "Heavy traffic density",
      level: "low",
      icon: "🚦",
      lonOffset: -0.018,
      latOffset: -0.008,
    },
  ];

  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [anchorLng + point.lonOffset, anchorLat + point.latOffset],
      },
      properties: {
        id: point.id,
        category: point.category,
        title: point.title,
        subtitle: point.subtitle,
        level: point.level,
        icon: point.icon,
        lon: anchorLng + point.lonOffset,
        lat: anchorLat + point.latOffset,
      },
    })),
  };
};

/**
 * Custom dark Apple-style theme for MapLibre GL
 */
const createDarkAppleTheme = () => ({
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#0a0a0a',
      },
    },
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-opacity': 0.85,
        'raster-fade-duration': 250,
      },
    },
  ],
});

/**
 * MapLibreView component - renders interactive map with dark Apple-style theme
 */
export const MapLibreView: React.FC<MapLibreViewProps> = React.memo(({
  lat = 37.7749,
  lng = -122.4194,
  zoom = 12,
  onLocationClick,
  userLocation,
  accuracy = 0,
  heading = 0,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const clickHandlerRef = useRef<(e: maplibregl.MapMouseEvent & Object) => void | null>(null);
  const accuracyMarkerRef = useRef<maplibregl.Marker | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Setup map initialization
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: createDarkAppleTheme() as any,
      center: [lng, lat],
      zoom,
      pitch: 45,
      bearing: 0,
    });

    // Mark as loaded
    map.current.on('load', () => {
      setMapLoaded(true);

      // Add accuracy circle layer
      if (!map.current?.getSource('accuracy-circle')) {
        map.current?.addSource('accuracy-circle', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.current?.addLayer({
          id: 'accuracy-circle-fill',
          type: 'fill',
          source: 'accuracy-circle',
          paint: {
            'fill-color': '#22d3ee',
            'fill-opacity': 0.1,
          },
        });

        map.current?.addLayer({
          id: 'accuracy-circle-stroke',
          type: 'line',
          source: 'accuracy-circle',
          paint: {
            'line-color': '#22d3ee',
            'line-width': 1,
            'line-opacity': 0.3,
          },
        });
      }

      if (!map.current?.getSource('safety-points')) {
        map.current?.addSource('safety-points', {
          type: 'geojson',
          data: createSafetyFeatures(lat, lng),
        });

        map.current?.addLayer({
          id: 'safety-danger-glow',
          type: 'circle',
          source: 'safety-points',
          filter: ['==', ['get', 'category'], 'danger'],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 16, 15, 26],
            'circle-color': '#ef4444',
            'circle-opacity': 0.14,
            'circle-blur': 0.7,
          },
        });

        map.current?.addLayer({
          id: 'safety-construction-glow',
          type: 'circle',
          source: 'safety-points',
          filter: ['==', ['get', 'category'], 'construction'],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 14, 15, 22],
            'circle-color': '#f59e0b',
            'circle-opacity': 0.14,
            'circle-blur': 0.65,
          },
        });

        map.current?.addLayer({
          id: 'safety-services',
          type: 'circle',
          source: 'safety-points',
          filter: ['in', ['get', 'category'], ['literal', ['hospital', 'ambulance', 'police']]],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 7, 15, 11],
            'circle-color': [
              'match',
              ['get', 'category'],
              'hospital', '#38bdf8',
              'ambulance', '#34d399',
              'police', '#fb7185',
              '#22d3ee',
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': 0.95,
          },
        });

        map.current?.addLayer({
          id: 'safety-labels',
          type: 'symbol',
          source: 'safety-points',
          layout: {
            'text-field': ['get', 'title'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 15, 14],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'icon-allow-overlap': true,
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          },
          paint: {
            'text-color': '#f8fafc',
            'text-halo-color': '#020617',
            'text-halo-width': 1.5,
          },
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update click handler when onLocationClick changes
  useEffect(() => {
    if (!map.current) return;

    // Remove old click handler if it exists
    if (clickHandlerRef.current) {
      map.current.off('click', clickHandlerRef.current);
    }

    // Add new click handler
    const handleMapClick = (e: maplibregl.MapMouseEvent & Object) => {
      if (onLocationClick) {
        onLocationClick(e.lngLat.lat, e.lngLat.lng);
      }
    };
    
    clickHandlerRef.current = handleMapClick;
    map.current.on('click', handleMapClick);

    return () => {
      if (map.current && clickHandlerRef.current) {
        map.current.off('click', clickHandlerRef.current);
      }
    };
  }, [onLocationClick]);

  // Update user location marker with Google Maps-style pin
  useEffect(() => {
    if (!map.current || !userLocation || !mapLoaded) return;

    // Remove old markers
    if (accuracyMarkerRef.current) {
      accuracyMarkerRef.current.remove();
    }
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
    }

    // Create accuracy circle as GeoJSON
    if (map.current.getSource('accuracy-circle')) {
      const accuracyKm = accuracy / 1000;
      const circle = createCircleGeoJSON(userLocation.lng, userLocation.lat, accuracyKm);
      (map.current.getSource('accuracy-circle') as any).setData(circle);
    }

    if (map.current.getSource('safety-points')) {
      const safetyData = createSafetyFeatures(userLocation.lat, userLocation.lng);
      (map.current.getSource('safety-points') as any).setData(safetyData);
    }

    // Create custom location marker element (Google Maps style)
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-location-marker';
    markerElement.innerHTML = `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        {/* Pulsing accuracy ring */}
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 2px solid rgba(34, 211, 238, 0.3);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        "></div>

        {/* Main blue dot with direction indicator */}
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${heading}deg);
          width: 24px;
          height: 24px;
        ">
          {/* Outer white ring (Google Maps style) */}
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 24px;
            background: white;
            border: 3px solid #2196F3;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          "></div>

          {/* Direction arrow */}
          <div style="
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 10px solid #2196F3;
          "></div>
        </div>
      </div>

      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(34, 211, 238, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
          }
        }
      </style>
    `;

    // Add marker to map
    locationMarkerRef.current = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

    // Center map on user location (smooth animation)
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      duration: 1000,
      essential: true,
    });
  }, [userLocation, accuracy, heading, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      className="relative w-full h-full overflow-hidden pointer-events-auto"
      style={{
        background: '#0a0a0a',
      }}
    >
    </div>
  );
});
