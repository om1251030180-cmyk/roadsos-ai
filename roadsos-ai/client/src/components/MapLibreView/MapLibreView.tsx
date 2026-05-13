"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ContextualPopup, PopupData, PopupType } from "@/components/ContextualPopup/ContextualPopup";
import { create3DMarkerElement, getCategoryTheme } from "@/utils/markerIcons";

interface MapLibreViewProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  onLocationClick?: (lat: number, lng: number) => void;
  onPointSelect?: (data: any) => void;
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
  iconUrl: string;
  details: Array<{ label: string; value: string }>;
  raw: Record<string, unknown>;
};

type SelectedPopup = {
  point: MapPrototypePoint;
  data: PopupData;
  position: { x: number; y: number };
  expanded?: boolean;
};

const DATASET_URL = "/data/roadsos-dummy-db.json";

const ICON_BY_CATEGORY: Record<string, string> = {
  hospital: "/icons/hospital.svg",
  ambulance: "/icons/ambulance.svg",
  police: "/icons/police.svg",
  danger_zone: "/icons/danger.svg",
  road_quality: "/icons/road-quality.svg",
  flood_zone: "/icons/flood.svg",
  traffic: "/icons/traffic.svg",
  construction: "/icons/construction.svg",
  cctv: "/icons/cctv.svg",
  ai_alert: "/icons/ai-alert.svg",
};

const POPUP_TYPE_BY_CATEGORY: Record<string, PopupType> = {
  hospital: "hospital",
  ambulance: "service",
  police: "service",
  danger_zone: "alert",
  road_quality: "road",
  flood_zone: "alert",
  traffic: "road",
  construction: "alert",
  cctv: "service",
  ai_alert: "alert",
};

const getIconUrl = (category: string) => ICON_BY_CATEGORY[category] ?? "/icons/danger.svg";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createCircleGeoJSON = (lon: number, lat: number, radiusKm: number) => {
  const numberOfPoints = 64;
  const points: Array<[number, number]> = [];

  for (let index = 0; index < numberOfPoints; index++) {
    const angle = (index / numberOfPoints) * (2 * Math.PI);
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const latOffset = dy / 111;
    const lonOffset = dx / (111 * Math.cos((lat * Math.PI) / 180));
    points.push([lon + lonOffset, lat + latOffset]);
  }

  points.push(points[0]);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [points],
        },
        properties: {},
      },
    ],
  };
};

const createDarkAppleTheme = () => ({
  version: 8,
  sources: {},
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#0a0c1a",
      },
    },
  ],
});

const buildMapPoints = (database: RoadSoSDummyDatabase): MapPrototypePoint[] => {
  const points: MapPrototypePoint[] = [];

  database.hospitals.forEach((item) => {
    points.push({
      id: `hospital-${item.id}`,
      category: "hospital",
      title: item.name,
      subtitle: String(item.status ?? "Hospital"),
      lat: item.lat,
      lng: item.lng,
      badge: "🏥",
      accent: "#22c55e",
      iconUrl: getIconUrl("hospital"),
      details: [
        { label: "Beds available", value: String(item.beds_available ?? "N/A") },
        { label: "Emergency", value: String(Boolean(item.emergency) ? "Yes" : "No") },
        { label: "Rating", value: String(item.rating ?? "N/A") },
        { label: "ETA", value: `${String(item.eta_minutes ?? "N/A")} mins` },
        { label: "Phone", value: String(item.phone ?? "N/A") },
        { label: "Road quality", value: String(item.road_quality ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.ambulances.forEach((item) => {
    points.push({
      id: `ambulance-${item.id}`,
      category: "ambulance",
      title: item.name,
      subtitle: String(Boolean(item.available) ? "Available" : "Busy"),
      lat: item.lat,
      lng: item.lng,
      badge: "🚑",
      accent: Boolean(item.available) ? "#34d399" : "#fb7185",
      iconUrl: getIconUrl("ambulance"),
      details: [
        { label: "Available", value: String(Boolean(item.available) ? "Yes" : "No") },
        { label: "ETA", value: `${String(item.eta_minutes ?? "N/A")} mins` },
        { label: "Speed", value: `${String(item.speed ?? "N/A")} km/h` },
        { label: "Driver", value: String(item.driver ?? "N/A") },
        { label: "Contact", value: String(item.contact ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.police.forEach((item) => {
    points.push({
      id: `police-${item.id}`,
      category: "police",
      title: item.name,
      subtitle: String(item.status ?? "Police station"),
      lat: item.lat,
      lng: item.lng,
      badge: "🚨",
      accent: "#f43f5e",
      iconUrl: getIconUrl("police"),
      details: [
        { label: "Status", value: String(item.status ?? "N/A") },
        { label: "Officers available", value: String(item.officers_available ?? "N/A") },
        { label: "Phone", value: String(item.phone ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.danger_zones.forEach((item) => {
    points.push({
      id: `danger-${item.id}`,
      category: "danger_zone",
      title: item.name,
      subtitle: String(item.severity ?? "Risk area"),
      lat: item.lat,
      lng: item.lng,
      badge: "⚠️",
      accent: "#ef4444",
      iconUrl: getIconUrl("danger_zone"),
      details: [
        { label: "Severity", value: String(item.severity ?? "N/A") },
        { label: "Accidents last year", value: String(item.accidents_last_year ?? "N/A") },
        { label: "Peak time", value: String(item.peak_time ?? "N/A") },
        { label: "Risk score", value: String(item.risk_score ?? "N/A") },
        { label: "Reason", value: String(item.reason ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.road_quality.forEach((item) => {
    const status = String(item.status ?? "Road quality");

    points.push({
      id: `road-quality-${item.id}`,
      category: "road_quality",
      title: item.road_name,
      subtitle: `${status} • ${String(item.quality_score ?? "N/A")}/100`,
      lat: item.lat,
      lng: item.lng,
      badge: "🛣️",
      accent: status.toLowerCase() === "poor" ? "#f59e0b" : "#22c55e",
      iconUrl: getIconUrl("road_quality"),
      details: [
        { label: "Quality score", value: String(item.quality_score ?? "N/A") },
        { label: "Status", value: status },
        { label: "Maintenance due", value: String(item.maintenance_due ?? "N/A") },
        { label: "Potholes", value: String(item.potholes ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.flood_zones.forEach((item) => {
    points.push({
      id: `flood-${item.id}`,
      category: "flood_zone",
      title: item.name,
      subtitle: String(item.severity ?? "Flood zone"),
      lat: item.lat,
      lng: item.lng,
      badge: "🌊",
      accent: "#3b82f6",
      iconUrl: getIconUrl("flood_zone"),
      details: [
        { label: "Severity", value: String(item.severity ?? "N/A") },
        { label: "Water level", value: String(item.water_level ?? "N/A") },
        { label: "Visibility", value: String(item.visibility ?? "N/A") },
        { label: "Safe", value: String(Boolean(item.safe) ? "Yes" : "No") },
      ],
      raw: item,
    });
  });

  database.traffic.forEach((item) => {
    const trafficLevel = String(item.traffic_level ?? "Traffic data");

    points.push({
      id: `traffic-${item.id}`,
      category: "traffic",
      title: item.road,
      subtitle: trafficLevel,
      lat: item.lat,
      lng: item.lng,
      badge: "🚦",
      accent: trafficLevel.toLowerCase() === "heavy" ? "#f97316" : "#eab308",
      iconUrl: getIconUrl("traffic"),
      details: [
        { label: "Traffic level", value: trafficLevel },
        { label: "Average speed", value: `${String(item.average_speed ?? "N/A")} km/h` },
        { label: "Congestion score", value: String(item.congestion_score ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.construction.forEach((item) => {
    points.push({
      id: `construction-${item.id}`,
      category: "construction",
      title: item.name,
      subtitle: String(item.severity ?? "Construction"),
      lat: item.lat,
      lng: item.lng,
      badge: "🏗️",
      accent: "#f59e0b",
      iconUrl: getIconUrl("construction"),
      details: [
        { label: "Severity", value: String(item.severity ?? "N/A") },
        { label: "Lanes blocked", value: String(item.lanes_blocked ?? "N/A") },
        { label: "Expected completion", value: String(item.expected_completion ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.cctv.forEach((item) => {
    points.push({
      id: `cctv-${item.id}`,
      category: "cctv",
      title: item.name,
      subtitle: String(item.status ?? "CCTV"),
      lat: item.lat,
      lng: item.lng,
      badge: "📷",
      accent: "#a855f7",
      iconUrl: getIconUrl("cctv"),
      details: [
        { label: "Status", value: String(item.status ?? "N/A") },
        { label: "AI detection", value: String(Boolean(item.ai_detection) ? "Yes" : "No") },
        { label: "Violations today", value: String(item.violations_today ?? "N/A") },
      ],
      raw: item,
    });
  });

  database.ai_alerts.forEach((item) => {
    points.push({
      id: `ai-alert-${item.id}`,
      category: "ai_alert",
      title: item.title,
      subtitle: "AI prediction alert",
      lat: item.lat,
      lng: item.lng,
      badge: "🧠",
      accent: "#0ea5e9",
      iconUrl: getIconUrl("ai_alert"),
      details: [
        { label: "Risk score", value: String(item.risk_score ?? "N/A") },
        { label: "Message", value: String(item.message ?? "N/A") },
      ],
      raw: item,
    });
  });

  return points;
};

const createMarkerElement = (point: MapPrototypePoint) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", point.title);
  button.style.cssText = [
    "position: relative",
    "border: 0",
    "padding: 0",
    "background: transparent",
    "cursor: pointer",
    "display: inline-flex",
    "align-items: center",
    "justify-content: center",
    "transform: translateY(-8px)",
  ].join(";");

  // Get the category theme for this point
  const theme = getCategoryTheme(point.category);
  
  // Create the 3D marker element using the new icon system
  const markerInner = create3DMarkerElement(theme, point.title);
  button.appendChild(markerInner);

  // Add hover animation
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-12px) scale(1.08)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(-8px) scale(1)";
  });

  return button;
};

const buildPopupData = (point: MapPrototypePoint): PopupData => {
  const type = POPUP_TYPE_BY_CATEGORY[point.category] ?? "service";
  const accent = point.accent;

  const openDirections = () => {
    if (typeof window === "undefined") return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareLocation = async () => {
    if (typeof window === "undefined") return;
    const payload = `${point.title} (${point.lat.toFixed(5)}, ${point.lng.toFixed(5)})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: point.title,
          text: payload,
          url: window.location.href,
        });
        return;
      } catch {
        // ignore share cancellation
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(payload);
    }
  };

  const saveLocation = async () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`${point.title} - ${point.lat}, ${point.lng}`);
  };

  const getPhoneNumber = () => {
    const candidate = point.raw.phone || point.raw.contact || point.raw.service_number || point.raw.number;
    return typeof candidate === "string" ? candidate : undefined;
  };

  const callAction = () => {
    const phone = getPhoneNumber();
    if (phone && typeof window !== "undefined") {
      window.location.href = `tel:${phone}`;
    }
  };

  const summary =
    point.category === "hospital"
      ? `${point.raw.status ?? "Hospital"} • ${point.raw.beds_available ?? "N/A"} beds available`
      : point.category === "police"
        ? `${point.raw.status ?? "Police station"} • ${point.raw.officers_available ?? "N/A"} officers ready`
        : point.category === "danger_zone"
          ? `${point.raw.severity ?? "Risk"} danger • ${point.raw.risk_score ?? "N/A"} AI risk score`
          : point.category === "road_quality"
            ? `${point.raw.status ?? "Road"} • ${point.raw.quality_score ?? "N/A"}/100 surface score`
            : point.category === "flood_zone"
              ? `${point.raw.severity ?? "Flood"} flood risk • ${point.raw.water_level ?? "N/A"}`
              : point.category === "traffic"
                ? `${point.raw.traffic_level ?? "Traffic"} flow • ${point.raw.average_speed ?? "N/A"} km/h average`
                : point.category === "construction"
                  ? `${point.raw.severity ?? "Construction"} impact • ${point.raw.lanes_blocked ?? "N/A"} lanes affected`
                  : point.category === "cctv"
                    ? `${point.raw.status ?? "Camera"} feed • ${point.raw.violations_today ?? "N/A"} violations today`
                    : point.category === "ai_alert"
                      ? `${point.raw.risk_score ?? "N/A"} risk score • proactive guidance active`
                      : `Smart context is attached to ${point.title}`;

  const insight =
    point.category === "hospital"
      ? "AI recommends the fastest trauma route and keeps emergency access visible."
      : point.category === "danger_zone"
        ? "Accident probability is elevated here. The map is biasing safer detours."
        : point.category === "road_quality"
          ? "Road condition, pothole density, and maintenance timing are combined."
          : point.category === "flood_zone"
            ? "Flood exposure and visibility are being weighted for route planning."
            : point.category === "traffic"
              ? "Traffic flow is being interpreted live to avoid congestion spikes."
              : point.category === "construction"
                ? "Construction impact is being surfaced so navigation can reroute early."
                : point.category === "police"
                  ? "Emergency response context and contact actions are ready instantly."
                  : point.category === "cctv"
                    ? "Coverage and live monitoring are available for situational awareness."
                    : point.category === "ai_alert"
                      ? String(point.raw.message ?? "AI has detected a situational risk signal.")
                      : `Smart context is attached to ${point.title}.`;

  const actions: NonNullable<PopupData["actions"]> = [];

  if (point.category === "hospital") {
    actions.push(
      { label: "Navigate", icon: "🧭", onClick: openDirections, color: "bg-white/10 text-white border border-white/14 hover:bg-white/16" },
      { label: "Call", icon: "📞", onClick: callAction, color: "bg-cyan-400/15 text-cyan-50 border border-cyan-300/20 hover:bg-cyan-400/22" },
      { label: "Share", icon: "↗", onClick: shareLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" },
      { label: "Save", icon: "★", onClick: saveLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" }
    );
  } else if (point.category === "police") {
    actions.push(
      { label: "Navigate", icon: "🧭", onClick: openDirections, color: "bg-white/10 text-white border border-white/14 hover:bg-white/16" },
      { label: "Call", icon: "📞", onClick: callAction, color: "bg-rose-400/15 text-rose-50 border border-rose-300/20 hover:bg-rose-400/22" },
      { label: "Report", icon: "⚡", onClick: shareLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" }
    );
  } else if (point.category === "danger_zone" || point.category === "flood_zone" || point.category === "ai_alert") {
    actions.push(
      { label: "Safer route", icon: "🛣️", onClick: openDirections, color: "bg-emerald-400/15 text-emerald-50 border border-emerald-300/20 hover:bg-emerald-400/22" },
      { label: "Avoid area", icon: "⛔", onClick: saveLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" },
      { label: "Share", icon: "↗", onClick: shareLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" }
    );
  } else if (point.category === "road_quality" || point.category === "traffic" || point.category === "construction") {
    actions.push(
      { label: "Route", icon: "🧭", onClick: openDirections, color: "bg-white/10 text-white border border-white/14 hover:bg-white/16" },
      { label: "Save", icon: "★", onClick: saveLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" },
      { label: "Share", icon: "↗", onClick: shareLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" }
    );
  } else {
    actions.push(
      { label: "Navigate", icon: "🧭", onClick: openDirections, color: "bg-white/10 text-white border border-white/14 hover:bg-white/16" },
      { label: "Share", icon: "↗", onClick: shareLocation, color: "bg-white/8 text-white border border-white/12 hover:bg-white/14" }
    );
  }

  const primaryInfo =
    point.category === "hospital"
      ? [
          { label: "Beds", value: String(point.raw.beds_available ?? "N/A"), color: accent },
          { label: "ETA", value: `${String(point.raw.eta_minutes ?? "N/A")} min`, color: "#f8fafc" },
          { label: "Rating", value: String(point.raw.rating ?? "N/A"), color: "#f8fafc" },
          { label: "Status", value: String(point.raw.status ?? "N/A"), color: "#f8fafc" },
        ]
      : point.category === "police"
        ? [
            { label: "Officers", value: String(point.raw.officers_available ?? "N/A"), color: accent },
            { label: "Contact", value: String(point.raw.phone ?? "N/A"), color: "#f8fafc" },
            { label: "Status", value: String(point.raw.status ?? "N/A"), color: "#f8fafc" },
            { label: "ETA", value: "Fast response", color: "#f8fafc" },
          ]
        : point.category === "danger_zone"
          ? [
              { label: "Risk score", value: String(point.raw.risk_score ?? "N/A"), color: accent },
              { label: "Severity", value: String(point.raw.severity ?? "N/A"), color: "#f8fafc" },
              { label: "Peak", value: String(point.raw.peak_time ?? "N/A"), color: "#f8fafc" },
              { label: "Accidents", value: String(point.raw.accidents_last_year ?? "N/A"), color: "#f8fafc" },
            ]
          : point.category === "road_quality"
            ? [
                { label: "Score", value: `${String(point.raw.quality_score ?? "N/A")}/100`, color: accent },
                { label: "Status", value: String(point.raw.status ?? "N/A"), color: "#f8fafc" },
                { label: "Potholes", value: String(point.raw.potholes ?? "N/A"), color: "#f8fafc" },
                { label: "Due", value: String(point.raw.maintenance_due ?? "N/A"), color: "#f8fafc" },
              ]
            : point.category === "flood_zone"
              ? [
                  { label: "Severity", value: String(point.raw.severity ?? "N/A"), color: accent },
                  { label: "Water", value: String(point.raw.water_level ?? "N/A"), color: "#f8fafc" },
                  { label: "Visibility", value: String(point.raw.visibility ?? "N/A"), color: "#f8fafc" },
                  { label: "Safe", value: String(Boolean(point.raw.safe) ? "Yes" : "No"), color: "#f8fafc" },
                ]
              : point.category === "traffic"
                ? [
                    { label: "Level", value: String(point.raw.traffic_level ?? "N/A"), color: accent },
                    { label: "Speed", value: `${String(point.raw.average_speed ?? "N/A")} km/h`, color: "#f8fafc" },
                    { label: "Congestion", value: String(point.raw.congestion_score ?? "N/A"), color: "#f8fafc" },
                    { label: "Route", value: "Live flow", color: "#f8fafc" },
                  ]
                : point.category === "construction"
                  ? [
                      { label: "Severity", value: String(point.raw.severity ?? "N/A"), color: accent },
                      { label: "Lanes", value: String(point.raw.lanes_blocked ?? "N/A"), color: "#f8fafc" },
                      { label: "ETA", value: String(point.raw.expected_completion ?? "N/A"), color: "#f8fafc" },
                      { label: "Mode", value: "Caution", color: "#f8fafc" },
                    ]
                  : point.category === "cctv"
                    ? [
                        { label: "Status", value: String(point.raw.status ?? "N/A"), color: accent },
                        { label: "AI", value: String(Boolean(point.raw.ai_detection) ? "On" : "Off"), color: "#f8fafc" },
                        { label: "Violations", value: String(point.raw.violations_today ?? "N/A"), color: "#f8fafc" },
                        { label: "Feed", value: "Live", color: "#f8fafc" },
                      ]
                    : point.category === "ai_alert"
                      ? [
                          { label: "Risk", value: String(point.raw.risk_score ?? "N/A"), color: accent },
                          { label: "Signal", value: "Live", color: "#f8fafc" },
                          { label: "Mode", value: "Proactive", color: "#f8fafc" },
                          { label: "Area", value: point.subtitle, color: "#f8fafc" },
                        ]
                      : [
                          { label: "Location", value: point.subtitle, color: accent },
                          { label: "Mode", value: "Contextual", color: "#f8fafc" },
                          { label: "AI", value: "Ready", color: "#f8fafc" },
                          { label: "Status", value: "Live", color: "#f8fafc" },
                        ];

  const secondaryInfo =
    point.category === "hospital"
      ? [
          { label: "Emergency support", value: String(Boolean(point.raw.emergency) ? "Yes" : "No") },
          { label: "Road quality", value: String(point.raw.road_quality ?? "N/A") },
          { label: "Phone", value: String(point.raw.phone ?? "N/A") },
        ]
      : point.category === "police"
        ? [
            { label: "Status", value: String(point.raw.status ?? "N/A") },
            { label: "Emergency number", value: String(point.raw.phone ?? "100") },
          ]
        : point.category === "danger_zone"
          ? [
              { label: "Reason", value: String(point.raw.reason ?? "N/A") },
              { label: "Category", value: "Accident-prone" },
            ]
          : point.category === "flood_zone"
            ? [
                { label: "Recommended", value: String(Boolean(point.raw.safe) ? "Proceed" : "Avoid") },
                { label: "Category", value: "Flood risk" },
              ]
            : point.category === "traffic"
              ? [
                  { label: "Average speed", value: `${String(point.raw.average_speed ?? "N/A")} km/h` },
                  { label: "Congestion score", value: String(point.raw.congestion_score ?? "N/A") },
                ]
              : point.category === "road_quality"
                ? [
                    { label: "Maintenance", value: String(point.raw.maintenance_due ?? "N/A") },
                    { label: "Authority", value: "Road services" },
                  ]
                : point.category === "construction"
                  ? [
                      { label: "Impact", value: `${String(point.raw.lanes_blocked ?? "N/A")} lanes blocked` },
                      { label: "Completion", value: String(point.raw.expected_completion ?? "N/A") },
                    ]
                  : point.category === "cctv"
                    ? [
                        { label: "Violations today", value: String(point.raw.violations_today ?? "N/A") },
                        { label: "Camera", value: String(point.raw.status ?? "N/A") },
                      ]
                    : point.category === "ai_alert"
                      ? [
                          { label: "Alert", value: String(point.raw.message ?? "N/A") },
                          { label: "Category", value: "AI risk" },
                        ]
                      : [];

  return {
    title: point.title,
    type,
    icon: point.badge,
    primaryInfo,
    secondaryInfo,
    actions,
    summary,
    insight,
    accent,
  };
};

const buildLocationMarkerElement = (heading: number) => {
  const markerElement = document.createElement("div");
  markerElement.className = "custom-location-marker";
  markerElement.innerHTML = `
    <div style="position:relative;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">
      <!-- Glowing Pulse Base -->
      <div style="position:absolute;inset:0;border-radius:999px;background:radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(34,211,238,0.05) 50%, transparent 70%);animation:roadsos-orb-pulse 2.5s ease-out infinite;"></div>
      
      <!-- Direction Cone -->
      <div style="position:absolute;width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:40px solid rgba(34,211,238,0.25);filter:blur(4px);transform:translateY(-24px) rotate(${heading}deg);transform-origin: 50% 100%;"></div>
      
      <!-- The Orb -->
      <div style="position:relative;width:20px;height:20px;border-radius:999px;background:white;box-shadow:0 0 15px white, 0 0 30px rgba(34,211,238,0.8);display:flex;align-items:center;justify-content:center;z-index:2;">
        <div style="width:14px;height:14px;border-radius:999px;background:linear-gradient(135deg, #22d3ee, #0ea5e9);"></div>
      </div>
    </div>
    <style>
      @keyframes roadsos-orb-pulse {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `;
  return markerElement;
};

const calculatePopupPosition = (map: maplibregl.Map, point: MapPrototypePoint) => {
  const projected = map.project([point.lng, point.lat]);
  const canvas = map.getCanvas();
  return {
    x: clamp(projected.x, 18, canvas.clientWidth - 18),
    y: clamp(projected.y - 22, 120, canvas.clientHeight - 120),
  };
};

export const MapLibreView: React.FC<MapLibreViewProps> = React.memo(({
  lat = 37.7749,
  lng = -122.4194,
  zoom = 12,
  onLocationClick,
  onPointSelect,
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
  const [selectedPopup, setSelectedPopup] = useState<SelectedPopup | null>(null);

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
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Prefer a known-working hosted style for reliability in dev.
    // Keep `createDarkAppleTheme` available but use a stable demo style by default
    // so tiles and sources load correctly.
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Use MapLibre demo style which includes required `sources` and tile endpoints
      style: "https://demotiles.maplibre.org/style.json",
      center: [lng, lat],
      zoom,
      minZoom: 3,
      maxZoom: 18,
      pitch: 52,
      bearing: 0,
    });

    map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.current.on("load", () => {
      setMapLoaded(true);

      // Attach basic error logging to help diagnose tile/style issues in the browser console
      map.current?.on("error", (e) => {
        // eslint-disable-next-line no-console
        console.warn("MapLibre error:", e);
      });

      // Prefer satellite raster if a MapTiler key is provided (NEXT_PUBLIC_MAPTILER_KEY)
      // otherwise fall back to OpenStreetMap raster tiles. This keeps the map useful
      // during development without a paid provider key.
      try {
        const m = map.current;
        const beforeLayerId = m && m.getStyle().layers && m.getStyle().layers.length > 0 ? m.getStyle().layers[0].id : undefined;

        // Client-exposed env var for MapTiler (set in .env.local as NEXT_PUBLIC_MAPTILER_KEY)
        const MAPTILER_KEY = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "") : "";

        if (m) {
          // Use Esri World Imagery (no API key required) as the primary satellite source.
          // Esri's World_Imagery tiles are widely available and suitable for free development use.
          if (!m.getSource("esri-tiles")) {
            m.addSource("esri-tiles", {
              type: "raster",
              tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
              tileSize: 256,
            } as any);

            m.addLayer(
              {
                id: "esri-raster-layer",
                type: "raster",
                source: "esri-tiles",
                paint: { "raster-opacity": 1 },
              } as any,
              beforeLayerId
            );
          }

          // Keep OSM raster as a fallback if Esri is unavailable for any reason.
          if (!m.getSource("osm-tiles") && !m.getSource("esri-tiles")) {
            m.addSource("osm-tiles", {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
            } as any);

            m.addLayer(
              {
                id: "osm-raster-layer",
                type: "raster",
                source: "osm-tiles",
                paint: { "raster-opacity": 1 },
              } as any,
              beforeLayerId
            );
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to add raster fallback tiles:", err);
      }

      if (!map.current?.getSource("accuracy-circle")) {
        map.current?.addSource("accuracy-circle", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.current?.addLayer({
          id: "accuracy-circle-fill",
          type: "fill",
          source: "accuracy-circle",
          paint: {
            "fill-color": "#22d3ee",
            "fill-opacity": 0.08,
          },
        });

        map.current?.addLayer({
          id: "accuracy-circle-stroke",
          type: "line",
          source: "accuracy-circle",
          paint: {
            "line-color": "#22d3ee",
            "line-width": 1,
            "line-opacity": 0.28,
          },
        });
      }
    });

    return () => {
      dataMarkersRef.current.forEach((marker) => marker.remove());
      dataMarkersRef.current = [];

      accuracyMarkerRef.current?.remove();
      accuracyMarkerRef.current = null;

      locationMarkerRef.current?.remove();
      locationMarkerRef.current = null;

      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.easeTo({
      center: [lng, lat],
      zoom,
      duration: 900,
      essential: true,
    });
  }, [lat, lng, zoom, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !database) return;

    dataMarkersRef.current.forEach((marker) => marker.remove());
    dataMarkersRef.current = [];

    buildMapPoints(database).forEach((point) => {
      const markerElement = createMarkerElement(point);
      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: "bottom",
      }).setLngLat([point.lng, point.lat]).addTo(map.current!);

      markerElement.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const popupPosition = calculatePopupPosition(map.current!, point);

        setSelectedPopup((prev) => {
          // If same point clicked again, toggle expanded state
          if (prev && prev.point.id === point.id) {
            return { ...prev, position: popupPosition, expanded: !prev.expanded };
          }

          return { point, data: buildPopupData(point), position: popupPosition, expanded: false };
        });

        map.current?.easeTo({
          center: [point.lng, point.lat],
          zoom: Math.min(Math.max(map.current.getZoom(), 14), 16.5),
          duration: 1050,
          offset: [0, -90],
          essential: true,
        });

        if (onPointSelect) {
          onPointSelect({
            id: point.id,
            title: point.title,
            category: point.category,
            icon: point.badge,
            accent: point.accent,
            details: point.details,
            raw: point.raw
          });
        }
      });

      dataMarkersRef.current.push(marker);
    });

    return () => {
      dataMarkersRef.current.forEach((marker) => marker.remove());
      dataMarkersRef.current = [];
    };
  }, [database, mapLoaded]);

  useEffect(() => {
    if (!map.current || !userLocation || !mapLoaded) return;

    if (!locationMarkerRef.current) {
      locationMarkerRef.current = new maplibregl.Marker({
        element: buildLocationMarkerElement(heading),
        anchor: "center",
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }

    if (map.current.getSource("accuracy-circle")) {
      const accuracyKm = accuracy / 1000;
      const circle = createCircleGeoJSON(userLocation.lng, userLocation.lat, accuracyKm);
      (map.current.getSource("accuracy-circle") as maplibregl.GeoJSONSource).setData(circle as any);
    }

    locationMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    locationMarkerRef.current.getElement().innerHTML = buildLocationMarkerElement(heading).innerHTML;

    map.current.easeTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: Math.min(15.3, map.current.getMaxZoom() ?? 18),
      bearing: heading || map.current.getBearing(),
      duration: 980,
      essential: true,
    });
  }, [userLocation, accuracy, heading, mapLoaded]);

  useEffect(() => {
    if (!map.current || !selectedPopup || !mapLoaded) return;

    const updatePopupPosition = () => {
      setSelectedPopup((current) => {
        if (!current || !map.current) return current;
        return {
          ...current,
          position: calculatePopupPosition(map.current, current.point),
        };
      });
    };

    // Only add listeners, don't call on mount to prevent infinite loop
    map.current.on("move", updatePopupPosition);
    map.current.on("zoom", updatePopupPosition);
    map.current.on("resize", updatePopupPosition);

    return () => {
      map.current?.off("move", updatePopupPosition);
      map.current?.off("zoom", updatePopupPosition);
      map.current?.off("resize", updatePopupPosition);
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (!map.current) return;

    if (clickHandlerRef.current) {
      map.current.off("click", clickHandlerRef.current);
    }

    const handleMapClick = (event: maplibregl.MapMouseEvent & Object) => {
      setSelectedPopup(null);

      if (onLocationClick) {
        onLocationClick(event.lngLat.lat, event.lngLat.lng);
      }
    };

    clickHandlerRef.current = handleMapClick;
    map.current.on("click", handleMapClick);

    return () => {
      if (map.current && clickHandlerRef.current) {
        map.current.off("click", clickHandlerRef.current);
      }
    };
  }, [onLocationClick]);

  const popupElement = useMemo(
    () => (
      <ContextualPopup
        data={selectedPopup?.data ?? null}
        position={selectedPopup?.position}
        isOpen={Boolean(selectedPopup)}
        onClose={() => setSelectedPopup(null)}
      />
    ),
    [selectedPopup]
  );

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ 
        background: "#1a1a2e",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}
    >
      {/* MapLibre GL renders directly into this container */}
      <style>{`@keyframes roadsos-pulse { 0% { transform: scale(0.92); opacity: 0.45; } 70% { transform: scale(1.18); opacity: 0.08; } 100% { transform: scale(1.18); opacity: 0; } } @keyframes roadsos-loc-pulse { 0% { transform: scale(0.92); opacity: 0.45; } 70% { transform: scale(1.1); opacity: 0.12; } 100% { transform: scale(1.1); opacity: 0; } }`}</style>
      {/* Popup positioned absolutely within map container */}
      <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none" }}>
        {popupElement}
      </div>
    </div>
  );
});

export default MapLibreView;