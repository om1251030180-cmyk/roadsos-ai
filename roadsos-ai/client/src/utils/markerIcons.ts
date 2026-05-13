/**
 * Comprehensive marker icon and category system for RoadSoS
 * Supports medical, security, disaster, road safety, traffic, weather, AI, and smart city pins
 */

export type CategoryType =
  // Medical & Emergency
  | "hospital"
  | "ambulance"
  | "blood_bank"
  | "pharmacy"
  | "first_aid"
  | "emergency_shelter"
  | "fire_station"
  // Security & Safety
  | "police"
  | "police_traffic"
  | "cctv"
  | "ai_alert"
  | "emergency_call"
  // Disaster & Risk
  | "danger_zone"
  | "accident_zone"
  | "flood_zone"
  | "earthquake_zone"
  | "disaster_relief"
  // Road Safety
  | "high_risk_intersection"
  | "speed_camera"
  | "school_zone"
  | "dark_spot"
  | "pothole"
  | "road_closed"
  // Traffic & Transport
  | "traffic"
  | "traffic_jam"
  | "bus_stop"
  | "metro"
  | "toll"
  | "parking"
  | "fuel_station"
  | "ev_charging"
  // Weather & Conditions
  | "heavy_rain"
  | "fog"
  | "storm"
  | "heatwave"
  | "pollution"
  // AI & Smart City
  | "sensor_node"
  | "iot_device"
  | "smart_signal"
  | "monitoring_area"
  | "drone_monitoring"
  // Navigation & Routes
  | "safe_route"
  | "ambulance_route"
  | "evacuation_point"
  // Community & Reports
  | "citizen_report"
  | "community_alert"
  | "complaint_area"
  // Special & Premium
  | "live_ambulance"
  | "live_police"
  | "pulsing_beacon"
  | "dynamic_heatmap"
  | "safe_zone"
  | "sos_point";

export interface CategoryTheme {
  color: string;
  accentColor: string;
  emoji: string;
  label: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  icon3dStyle: "pin" | "dot" | "marker" | "beacon" | "pulse";
  hasGlow: boolean;
  hasPulse: boolean;
  glowColor: string;
}

export const CATEGORY_THEMES: Record<CategoryType, CategoryTheme> = {
  // 🚑 EMERGENCY & MEDICAL PINS (CYAN/GREEN)
  hospital: {
    color: "#38bdf8",
    accentColor: "#06b6d4",
    emoji: "🏥",
    label: "Hospital",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(56, 189, 248, 0.5)",
  },
  ambulance: {
    color: "#34d399",
    accentColor: "#10b981",
    emoji: "🚑",
    label: "Ambulance",
    severity: "critical",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(52, 211, 153, 0.6)",
  },
  blood_bank: {
    color: "#f87171",
    accentColor: "#ef4444",
    emoji: "🩸",
    label: "Blood Bank",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(248, 113, 113, 0.4)",
  },
  pharmacy: {
    color: "#60a5fa",
    accentColor: "#3b82f6",
    emoji: "💊",
    label: "Pharmacy",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(96, 165, 250, 0.3)",
  },
  first_aid: {
    color: "#fca5a5",
    accentColor: "#f87171",
    emoji: "🩹",
    label: "First Aid",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(252, 165, 165, 0.4)",
  },
  emergency_shelter: {
    color: "#f59e0b",
    accentColor: "#d97706",
    emoji: "🏚️",
    label: "Emergency Shelter",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  fire_station: {
    color: "#fb923c",
    accentColor: "#f97316",
    emoji: "🚒",
    label: "Fire Station",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(251, 146, 60, 0.5)",
  },

  // 👮 SECURITY & SAFETY PINS (RED/PURPLE/BLUE)
  police: {
    color: "#f43f5e",
    accentColor: "#e11d48",
    emoji: "🚨",
    label: "Police Station",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(244, 63, 94, 0.5)",
  },
  police_traffic: {
    color: "#e879f9",
    accentColor: "#d946ef",
    emoji: "🚓",
    label: "Traffic Police",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(232, 121, 249, 0.3)",
  },
  cctv: {
    color: "#a855f7",
    accentColor: "#9333ea",
    emoji: "📷",
    label: "CCTV Camera",
    severity: "medium",
    icon3dStyle: "dot",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(168, 85, 247, 0.3)",
  },
  emergency_call: {
    color: "#d32f2f",
    accentColor: "#b71c1c",
    emoji: "☎️",
    label: "Emergency Call",
    severity: "critical",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(211, 47, 47, 0.6)",
  },

  // ⚠️ DISASTER & RISK PINS (RED/ORANGE)
  danger_zone: {
    color: "#ef4444",
    accentColor: "#dc2626",
    emoji: "⚠️",
    label: "Danger Zone",
    severity: "critical",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(239, 68, 68, 0.6)",
  },
  accident_zone: {
    color: "#ff6b6b",
    accentColor: "#ee5a52",
    emoji: "💥",
    label: "Accident Zone",
    severity: "critical",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(255, 107, 107, 0.6)",
  },
  flood_zone: {
    color: "#3b82f6",
    accentColor: "#2563eb",
    emoji: "🌊",
    label: "Flood Zone",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(59, 130, 246, 0.5)",
  },
  earthquake_zone: {
    color: "#9333ea",
    accentColor: "#7e22ce",
    emoji: "🏚️",
    label: "Earthquake Zone",
    severity: "critical",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(147, 51, 234, 0.5)",
  },
  disaster_relief: {
    color: "#ec4899",
    accentColor: "#db2777",
    emoji: "🆘",
    label: "Disaster Relief",
    severity: "critical",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(236, 72, 153, 0.6)",
  },

  // 🛣️ ROAD SAFETY PINS (YELLOW/RED)
  high_risk_intersection: {
    color: "#fbbf24",
    accentColor: "#f59e0b",
    emoji: "🚗",
    label: "High Risk Intersection",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(251, 191, 36, 0.4)",
  },
  speed_camera: {
    color: "#ca8a04",
    accentColor: "#b45309",
    emoji: "📸",
    label: "Speed Camera",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(202, 138, 4, 0.3)",
  },
  school_zone: {
    color: "#fbbf24",
    accentColor: "#f59e0b",
    emoji: "🏫",
    label: "School Zone",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(251, 191, 36, 0.3)",
  },
  dark_spot: {
    color: "#6b7280",
    accentColor: "#4b5563",
    emoji: "🌑",
    label: "Dark Spot",
    severity: "medium",
    icon3dStyle: "dot",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(107, 114, 128, 0.3)",
  },
  pothole: {
    color: "#92400e",
    accentColor: "#78350f",
    emoji: "🕳️",
    label: "Pothole",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(146, 64, 14, 0.3)",
  },
  road_closed: {
    color: "#dc2626",
    accentColor: "#991b1b",
    emoji: "🚫",
    label: "Road Closed",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(220, 38, 38, 0.5)",
  },

  // 🚦 TRAFFIC & TRANSPORT PINS (YELLOW/ORANGE)
  traffic: {
    color: "#eab308",
    accentColor: "#ca8a04",
    emoji: "🚦",
    label: "Traffic",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(234, 179, 8, 0.3)",
  },
  traffic_jam: {
    color: "#ef4444",
    accentColor: "#dc2626",
    emoji: "🚗",
    label: "Traffic Jam",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(239, 68, 68, 0.4)",
  },
  bus_stop: {
    color: "#0284c7",
    accentColor: "#0369a1",
    emoji: "🚌",
    label: "Bus Stop",
    severity: "low",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(2, 132, 199, 0.3)",
  },
  metro: {
    color: "#1e40af",
    accentColor: "#1e3a8a",
    emoji: "🚇",
    label: "Metro Station",
    severity: "low",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(30, 64, 175, 0.3)",
  },
  toll: {
    color: "#84cc16",
    accentColor: "#65a30d",
    emoji: "💳",
    label: "Toll Plaza",
    severity: "low",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(132, 204, 22, 0.3)",
  },
  parking: {
    color: "#06b6d4",
    accentColor: "#0891b2",
    emoji: "🅿️",
    label: "Parking",
    severity: "info",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(6, 182, 212, 0.3)",
  },
  fuel_station: {
    color: "#f59e0b",
    accentColor: "#d97706",
    emoji: "⛽",
    label: "Fuel Station",
    severity: "low",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
  ev_charging: {
    color: "#10b981",
    accentColor: "#059669",
    emoji: "🔌",
    label: "EV Charging",
    severity: "low",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(16, 185, 129, 0.3)",
  },

  // 🌦️ WEATHER & CONDITIONS (BLUE/PURPLE)
  heavy_rain: {
    color: "#3b82f6",
    accentColor: "#2563eb",
    emoji: "🌧️",
    label: "Heavy Rain",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  fog: {
    color: "#9ca3af",
    accentColor: "#6b7280",
    emoji: "🌫️",
    label: "Fog",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(156, 163, 175, 0.3)",
  },
  storm: {
    color: "#4c1d95",
    accentColor: "#3c0753",
    emoji: "⛈️",
    label: "Storm",
    severity: "critical",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(76, 29, 149, 0.5)",
  },
  heatwave: {
    color: "#ff6b35",
    accentColor: "#ee5a24",
    emoji: "🌡️",
    label: "Heatwave",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(255, 107, 53, 0.4)",
  },
  pollution: {
    color: "#7c3aed",
    accentColor: "#6d28d9",
    emoji: "💨",
    label: "Pollution",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(124, 58, 237, 0.3)",
  },

  // 🤖 AI & SMART CITY PINS (CYAN/PURPLE)
  ai_alert: {
    color: "#0ea5e9",
    accentColor: "#0284c7",
    emoji: "🧠",
    label: "AI Alert",
    severity: "high",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(14, 165, 233, 0.6)",
  },
  sensor_node: {
    color: "#a78bfa",
    accentColor: "#8b5cf6",
    emoji: "📡",
    label: "Sensor Node",
    severity: "info",
    icon3dStyle: "dot",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(167, 139, 250, 0.3)",
  },
  iot_device: {
    color: "#6366f1",
    accentColor: "#4f46e5",
    emoji: "📱",
    label: "IoT Device",
    severity: "info",
    icon3dStyle: "dot",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(99, 102, 241, 0.3)",
  },
  smart_signal: {
    color: "#06b6d4",
    accentColor: "#0891b2",
    emoji: "🚦",
    label: "Smart Signal",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(6, 182, 212, 0.3)",
  },
  monitoring_area: {
    color: "#a855f7",
    accentColor: "#9333ea",
    emoji: "👁️",
    label: "Monitoring Area",
    severity: "medium",
    icon3dStyle: "dot",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(168, 85, 247, 0.3)",
  },
  drone_monitoring: {
    color: "#8b5cf6",
    accentColor: "#7c3aed",
    emoji: "🚁",
    label: "Drone Monitoring",
    severity: "medium",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(139, 92, 246, 0.4)",
  },

  // 🗺️ NAVIGATION & ROUTES (GREEN/BLUE)
  safe_route: {
    color: "#22c55e",
    accentColor: "#16a34a",
    emoji: "✅",
    label: "Safe Route",
    severity: "info",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(34, 197, 94, 0.3)",
  },
  ambulance_route: {
    color: "#34d399",
    accentColor: "#10b981",
    emoji: "🚑",
    label: "Ambulance Route",
    severity: "critical",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(52, 211, 153, 0.5)",
  },
  evacuation_point: {
    color: "#f59e0b",
    accentColor: "#d97706",
    emoji: "🚪",
    label: "Evacuation Point",
    severity: "high",
    icon3dStyle: "marker",
    hasGlow: true,
    hasPulse: false,
    glowColor: "rgba(245, 158, 11, 0.4)",
  },

  // 👥 COMMUNITY & REPORTS (PINK/PURPLE)
  citizen_report: {
    color: "#ec4899",
    accentColor: "#db2777",
    emoji: "📢",
    label: "Citizen Report",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  community_alert: {
    color: "#d946ef",
    accentColor: "#c026d3",
    emoji: "🔔",
    label: "Community Alert",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(217, 70, 239, 0.4)",
  },
  complaint_area: {
    color: "#f472b6",
    accentColor: "#ec4899",
    emoji: "🗣️",
    label: "Complaint Area",
    severity: "medium",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(244, 114, 182, 0.3)",
  },

  // ⚡ SPECIAL & PREMIUM PINS (RED/BLUE/GOLD)
  live_ambulance: {
    color: "#34d399",
    accentColor: "#10b981",
    emoji: "🚑",
    label: "Live Ambulance",
    severity: "critical",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(52, 211, 153, 0.7)",
  },
  live_police: {
    color: "#f43f5e",
    accentColor: "#e11d48",
    emoji: "🚗",
    label: "Live Police",
    severity: "high",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(244, 63, 94, 0.7)",
  },
  pulsing_beacon: {
    color: "#fbbf24",
    accentColor: "#f59e0b",
    emoji: "💡",
    label: "Beacon",
    severity: "high",
    icon3dStyle: "beacon",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(251, 191, 36, 0.6)",
  },
  dynamic_heatmap: {
    color: "#ff6b6b",
    accentColor: "#ff5252",
    emoji: "🔥",
    label: "Heatmap Zone",
    severity: "high",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(255, 107, 107, 0.7)",
  },
  safe_zone: {
    color: "#22c55e",
    accentColor: "#16a34a",
    emoji: "✅",
    label: "Safe Zone",
    severity: "low",
    icon3dStyle: "marker",
    hasGlow: false,
    hasPulse: false,
    glowColor: "rgba(34, 197, 94, 0.3)",
  },
  sos_point: {
    color: "#dc2626",
    accentColor: "#991b1b",
    emoji: "🆘",
    label: "SOS Point",
    severity: "critical",
    icon3dStyle: "pulse",
    hasGlow: true,
    hasPulse: true,
    glowColor: "rgba(220, 38, 38, 0.7)",
  },
};

/**
 * Maps data category to visual category theme
 */
export function getCategoryTheme(
  dataCategory: string
): CategoryTheme {
  const theme = CATEGORY_THEMES[dataCategory as CategoryType];
  if (theme) return theme;

  // Fallback mapping for legacy categories and aliases
  const mapping: Record<string, CategoryType> = {
    hospital: "hospital",
    ambulance: "ambulance",
    police: "police",
    danger_zone: "danger_zone",
    danger: "danger_zone",
    accident: "accident_zone",
    road_quality: "pothole",
    construction: "pothole",
    flood_zone: "flood_zone",
    flood: "flood_zone",
    traffic: "traffic",
    cctv: "cctv",
    camera: "cctv",
    ai_alert: "ai_alert",
    ai: "ai_alert",
    smart: "iot_device",
    fire: "fire_station",
    fire_station: "fire_station",
    emergency: "emergency_shelter",
    sos: "sos_point",
    alert: "community_alert",
    report: "citizen_report",
    route: "safe_route",
    safe: "safe_zone",
    zone: "safe_zone",
  };

  const mappedCategory = mapping[dataCategory.toLowerCase()] || "safe_zone";
  return CATEGORY_THEMES[mappedCategory];
}

/**
 * Creates a 3D-style marker pin HTML element with animations and glow
 */
export function create3DMarkerElement(
  theme: CategoryTheme,
  title: string
): HTMLElement {
  const marker = document.createElement("div");
  marker.className = "marker-3d-container";
  marker.setAttribute("data-category", title);

  const isPulse = theme.hasPulse;
  const hasGlow = theme.hasGlow;
  const glowEffect = hasGlow ? `box-shadow: 0 0 20px ${theme.glowColor}, 0 0 40px ${theme.glowColor};` : "";
  const pulseClass = isPulse ? "marker-pulse" : "";

  if (isPulse) {
    marker.innerHTML = `
      <style>
        @keyframes roadsos-marker-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 ${theme.glowColor}; }
          50% { box-shadow: 0 0 10px 8px ${theme.glowColor}; }
          100% { transform: scale(1); box-shadow: 0 0 0 20px transparent; }
        }
        .marker-pulse { animation: roadsos-marker-pulse 2s infinite; }
      </style>
      <div class="marker-3d-pin ${pulseClass}" style="
        position: relative;
        width: 48px;
        height: 56px;
        border-radius: 24px 24px 28px 28px;
        background: linear-gradient(135deg, ${theme.color} 0%, ${theme.accentColor} 100%);
        border: 2px solid rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        transform: perspective(600px) rotateX(8deg);
        ${glowEffect}
      ">
        ${theme.emoji}
      </div>
    `;
  } else {
    marker.innerHTML = `
      <div class="marker-3d-pin" style="
        position: relative;
        width: 48px;
        height: 56px;
        border-radius: 24px 24px 28px 28px;
        background: linear-gradient(135deg, ${theme.color} 0%, ${theme.accentColor} 100%);
        border: 2px solid rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        transform: perspective(600px) rotateX(8deg);
        ${glowEffect}
        transition: all 0.3s ease;
      " onmouseover="this.style.transform='perspective(600px) rotateX(8deg) scale(1.1)'; this.style.boxShadow='0 16px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'" 
        onmouseout="this.style.transform='perspective(600px) rotateX(8deg) scale(1)'; this.style.boxShadow='0 12px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'">
        ${theme.emoji}
      </div>
    `;
  }

  return marker;
}
