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

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Add geolocation control
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocate, 'bottom-right');

    // Mark as loaded
    map.current.on('load', () => {
      setMapLoaded(true);

      // Add 3D buildings layer if available
      if (!map.current?.getLayer('building')) {
        map.current?.addLayer(
          {
            id: 'building',
            source: 'composite',
            'source-layer': 'building',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': '#222',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6,
            },
          },
          'waterway'
        );
      }

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
      className="relative w-full h-full rounded-lg overflow-hidden border border-blue-500/20 pointer-events-auto"
      style={{
        background: '#0a0a0a',
      }}
    >
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-white/70 text-sm">Loading premium map...</p>
          </div>
        </div>
      )}
    </div>
  );
});
