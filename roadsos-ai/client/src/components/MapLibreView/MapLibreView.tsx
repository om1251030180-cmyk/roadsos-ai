'use client';

import React, { useEffect, useRef, useState } from 'react';
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

type RoadSoSDummyDatabase = {
  hospitals: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  ambulances: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  police: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  danger_zones: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  road_quality: Array<Record<string, unknown> & { id: number; road_name: string; lat: number; lng: number }>;
  flood_zones: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  traffic: Array<Record<string, unknown> & { id: number; road: string; lat: number; lng: number }>;
  construction: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  cctv: Array<Record<string, unknown> & { id: number; name: string; lat: number; lng: number }>;
  ai_alerts: Array<Record<string, unknown> & { id: number; title: string; lat: number; lng: number }>;
};

type MapPrototypePoint = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  badge: string;
  accent: string;
  details: Array<{ label: string; value: string }>;
};

const DATASET_URL = '/data/roadsos-dummy-db.json';

const createCircleGeoJSON = (lon: number, lat: number, radiusKm: number) => {
  const numberOfPoints = 64;
  const points: Array<[number, number]> = [];

  for (let i = 0; i < numberOfPoints; i++) {
    const angle = (i / numberOfPoints) * (2 * Math.PI);
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const latOffset = dy / 111;
    const lonOffset = dx / (111 * Math.cos((lat * Math.PI) / 180));
    points.push([lon + lonOffset, lat + latOffset]);
  }

  points.push(points[0]);

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
        'raster-opacity': 0.9,
        'raster-fade-duration': 250,
      },
    },
  ],
});

const buildMapPoints = (database: RoadSoSDummyDatabase): MapPrototypePoint[] => {
  const points: MapPrototypePoint[] = [];

  database.hospitals.forEach((item) => {
    points.push({
      id: `hospital-${item.id}`,
      category: 'hospital',
      title: item.name,
      subtitle: String(item.status ?? 'Hospital'),
      lat: item.lat,
      lng: item.lng,
      badge: '🏥',
      accent: '#22c55e',
      details: [
        { label: 'Beds available', value: String(item.beds_available ?? 'N/A') },
        { label: 'Emergency', value: String(Boolean(item.emergency) ? 'Yes' : 'No') },
        { label: 'Rating', value: String(item.rating ?? 'N/A') },
        { label: 'ETA', value: `${String(item.eta_minutes ?? 'N/A')} mins` },
        { label: 'Phone', value: String(item.phone ?? 'N/A') },
        { label: 'Road quality', value: String(item.road_quality ?? 'N/A') },
      ],
    });
  });

  database.ambulances.forEach((item) => {
    points.push({
      id: `ambulance-${item.id}`,
      category: 'ambulance',
      title: item.name,
      subtitle: String(Boolean(item.available) ? 'Available' : 'Busy'),
      lat: item.lat,
      lng: item.lng,
      badge: '🚑',
      accent: Boolean(item.available) ? '#34d399' : '#fb7185',
      details: [
        { label: 'Available', value: String(Boolean(item.available) ? 'Yes' : 'No') },
        { label: 'ETA', value: `${String(item.eta_minutes ?? 'N/A')} mins` },
        { label: 'Speed', value: `${String(item.speed ?? 'N/A')} km/h` },
        { label: 'Driver', value: String(item.driver ?? 'N/A') },
        { label: 'Contact', value: String(item.contact ?? 'N/A') },
      ],
    });
  });

  database.police.forEach((item) => {
    points.push({
      id: `police-${item.id}`,
      category: 'police',
      title: item.name,
      subtitle: String(item.status ?? 'Police station'),
      lat: item.lat,
      lng: item.lng,
      badge: '🚨',
      accent: '#f43f5e',
      details: [
        { label: 'Status', value: String(item.status ?? 'N/A') },
        { label: 'Officers available', value: String(item.officers_available ?? 'N/A') },
        { label: 'Phone', value: String(item.phone ?? 'N/A') },
      ],
    });
  });

  database.danger_zones.forEach((item) => {
    points.push({
      id: `danger-${item.id}`,
      category: 'danger_zone',
      title: item.name,
      subtitle: String(item.severity ?? 'Risk area'),
      lat: item.lat,
      lng: item.lng,
      badge: '⚠️',
      accent: '#ef4444',
      details: [
        { label: 'Severity', value: String(item.severity ?? 'N/A') },
        { label: 'Accidents last year', value: String(item.accidents_last_year ?? 'N/A') },
        { label: 'Peak time', value: String(item.peak_time ?? 'N/A') },
        { label: 'Risk score', value: String(item.risk_score ?? 'N/A') },
        { label: 'Reason', value: String(item.reason ?? 'N/A') },
      ],
    });
  });

  database.road_quality.forEach((item) => {
    points.push({
      id: `road-quality-${item.id}`,
      category: 'road_quality',
      title: item.road_name,
      subtitle: `${String(item.status ?? 'Road quality')} • ${String(item.quality_score ?? 'N/A')}/100`,
      lat: item.lat,
      lng: item.lng,
      badge: '🛣️',
      accent: String(item.status).toLowerCase() === 'poor' ? '#f59e0b' : '#22c55e',
      details: [
        { label: 'Quality score', value: String(item.quality_score ?? 'N/A') },
        { label: 'Status', value: String(item.status ?? 'N/A') },
        { label: 'Maintenance due', value: String(item.maintenance_due ?? 'N/A') },
        { label: 'Potholes', value: String(item.potholes ?? 'N/A') },
      ],
    });
  });

  database.flood_zones.forEach((item) => {
    points.push({
      id: `flood-${item.id}`,
      category: 'flood_zone',
      title: item.name,
      subtitle: String(item.severity ?? 'Flood zone'),
      lat: item.lat,
      lng: item.lng,
      badge: '🌊',
      accent: '#3b82f6',
      details: [
        { label: 'Severity', value: String(item.severity ?? 'N/A') },
        { label: 'Water level', value: String(item.water_level ?? 'N/A') },
        { label: 'Visibility', value: String(item.visibility ?? 'N/A') },
        { label: 'Safe', value: String(Boolean(item.safe) ? 'Yes' : 'No') },
      ],
    });
  });

  database.traffic.forEach((item) => {
    points.push({
      id: `traffic-${item.id}`,
      category: 'traffic',
      title: item.road,
      subtitle: String(item.traffic_level ?? 'Traffic data'),
      lat: item.lat,
      lng: item.lng,
      badge: '🚦',
      accent: String(item.traffic_level).toLowerCase() === 'heavy' ? '#f97316' : '#eab308',
      details: [
        { label: 'Traffic level', value: String(item.traffic_level ?? 'N/A') },
        { label: 'Average speed', value: `${String(item.average_speed ?? 'N/A')} km/h` },
        { label: 'Congestion score', value: String(item.congestion_score ?? 'N/A') },
      ],
    });
  });

  database.construction.forEach((item) => {
    points.push({
      id: `construction-${item.id}`,
      category: 'construction',
      title: item.name,
      subtitle: String(item.severity ?? 'Construction'),
      lat: item.lat,
      lng: item.lng,
      badge: '🏗️',
      accent: '#f59e0b',
      details: [
        { label: 'Severity', value: String(item.severity ?? 'N/A') },
        { label: 'Lanes blocked', value: String(item.lanes_blocked ?? 'N/A') },
        { label: 'Expected completion', value: String(item.expected_completion ?? 'N/A') },
      ],
    });
  });

  database.cctv.forEach((item) => {
    points.push({
      id: `cctv-${item.id}`,
      category: 'cctv',
      title: item.name,
      subtitle: String(item.status ?? 'CCTV'),
      lat: item.lat,
      lng: item.lng,
      badge: '📷',
      accent: '#a855f7',
      details: [
        { label: 'Status', value: String(item.status ?? 'N/A') },
        { label: 'AI detection', value: String(Boolean(item.ai_detection) ? 'Yes' : 'No') },
        { label: 'Violations today', value: String(item.violations_today ?? 'N/A') },
      ],
    });
  });

  database.ai_alerts.forEach((item) => {
    points.push({
      id: `ai-alert-${item.id}`,
      category: 'ai_alert',
      title: item.title,
      subtitle: 'AI prediction alert',
      lat: item.lat,
      lng: item.lng,
      badge: '🧠',
      accent: '#0ea5e9',
      details: [
        { label: 'Risk score', value: String(item.risk_score ?? 'N/A') },
        { label: 'Message', value: String(item.message ?? 'N/A') },
      ],
    });
  });

  return points;
};

const createMarkerElement = (point: MapPrototypePoint) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', point.title);
  button.style.cssText = [
    'position: relative',
    'border: 0',
    'padding: 0',
    'background: transparent',
    'cursor: pointer',
    'display: inline-flex',
    'align-items: center',
    'justify-content: center',
    'transform: translateY(-8px)'
  ].join(';');

  const isAlert = point.category === 'danger_zone' || point.category === 'flood_zone' || point.category === 'ai_alert';

  button.innerHTML = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:50px;height:50px;border-radius:999px;background:${point.accent};opacity:${isAlert ? 0.18 : 0.12};filter:blur(0px);"></div>
      <div style="position:relative;width:38px;height:38px;border-radius:999px;background:${point.accent};border:2px solid rgba(255,255,255,0.9);box-shadow:0 12px 28px rgba(0,0,0,0.38);display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;">
        ${point.badge}
      </div>
    </div>
  `;

  if (isAlert) {
    const pulse = document.createElement('span');
    pulse.style.cssText = 'position:absolute;width:56px;height:56px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);animation:roadsos-pulse 2s ease-in-out infinite;';
    button.appendChild(pulse);
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  return button;
};

const createPopupHtml = (point: MapPrototypePoint) => {
  const detailsHtml = point.details
    .map(
      (detail) => `
        <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-top:1px solid rgba(148,163,184,0.12);">
          <span style="color:#94a3b8;">${detail.label}</span>
          <span style="color:#f8fafc;text-align:right;">${detail.value}</span>
        </div>
      `
    )
    .join('');

  return `
    <div style="min-width:240px;max-width:280px;padding:14px 15px;border-radius:18px;background:rgba(2,6,23,0.96);color:#fff;font-family:Inter,Arial,sans-serif;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:34px;height:34px;border-radius:999px;background:${point.accent};display:flex;align-items:center;justify-content:center;font-size:18px;">${point.badge}</div>
        <div>
          <div style="font-size:15px;font-weight:700;line-height:1.2;">${point.title}</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:2px;">${point.subtitle}</div>
        </div>
      </div>
      <div style="margin-top:10px;font-size:12px;">${detailsHtml}</div>
    </div>
  `;
};

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
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent & Object) => void) | null>(null);
  const accuracyMarkerRef = useRef<maplibregl.Marker | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dataMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [database, setDatabase] = useState<RoadSoSDummyDatabase | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(DATASET_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load dummy database: ${response.status}`);
        }

        return response.json();
      })
      .then((data: RoadSoSDummyDatabase) => {
        setDatabase(data);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: createDarkAppleTheme() as any,
      center: [lng, lat],
      zoom,
      pitch: 45,
      bearing: 0,
    });

    map.current.on('load', () => {
      setMapLoaded(true);

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
      dataMarkersRef.current.forEach((marker) => marker.remove());
      dataMarkersRef.current = [];

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, zoom]);

  useEffect(() => {
    if (!map.current) return;

    if (clickHandlerRef.current) {
      map.current.off('click', clickHandlerRef.current);
    }

    const handleMapClick = (event: maplibregl.MapMouseEvent & Object) => {
      if (onLocationClick) {
        onLocationClick(event.lngLat.lat, event.lngLat.lng);
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

  useEffect(() => {
    if (!map.current || !mapLoaded || !database) return;

    dataMarkersRef.current.forEach((marker) => marker.remove());
    dataMarkersRef.current = [];

    buildMapPoints(database).forEach((point) => {
      const markerElement = createMarkerElement(point);
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false, closeOnClick: true }).setHTML(createPopupHtml(point));

      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'bottom',
      })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map.current!);

      dataMarkersRef.current.push(marker);
    });

    return () => {
      dataMarkersRef.current.forEach((marker) => marker.remove());
      dataMarkersRef.current = [];
    };
  }, [database, mapLoaded]);

  useEffect(() => {
    if (!map.current || !userLocation || !mapLoaded) return;

    if (accuracyMarkerRef.current) {
      accuracyMarkerRef.current.remove();
    }

    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
    }

    if (map.current.getSource('accuracy-circle')) {
      const accuracyKm = accuracy / 1000;
      const circle = createCircleGeoJSON(userLocation.lng, userLocation.lat, accuracyKm);
      (map.current.getSource('accuracy-circle') as maplibregl.GeoJSONSource).setData(circle as any);
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-location-marker';
    markerElement.innerHTML = `
      <div style="position:relative;width:40px;height:40px;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:60px;height:60px;border:2px solid rgba(34, 211, 238, 0.3);border-radius:50%;animation:roadsos-pulse 2s ease-in-out infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) rotate(${heading}deg);width:24px;height:24px;">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:24px;height:24px;background:white;border:3px solid #2196F3;border-radius:50%;box-shadow:0 2px 8px rgba(0, 0, 0, 0.3);"></div>
          <div style="position:absolute;top:-2px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #2196F3;"></div>
        </div>
      </div>
    `;

    locationMarkerRef.current = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

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
      style={{ background: '#0a0a0a' }}
    >
      <style>{`@keyframes roadsos-pulse { 0% { transform: scale(0.9); opacity: 0.45; } 70% { transform: scale(1.18); opacity: 0.08; } 100% { transform: scale(1.18); opacity: 0; } }`}</style>
    </div>
  );
});
