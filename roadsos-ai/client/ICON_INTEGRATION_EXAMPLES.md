/**
 * Quick Integration Guide: Using the 50+ Icon System with Dummy Data
 * 
 * Copy-paste ready examples for each category type
 */

// ============================================================================
// EXAMPLE 1: Hospital Marker
// ============================================================================

import maplibregl from "maplibre-gl";
import { getCategoryTheme, create3DMarkerElement } from "@/utils/markerIcons";

// Your dummy data point
const hospitalData = {
  id: "hosp-001",
  title: "City General Hospital",
  category: "hospital",  // ← Category type (from 50+ system)
  lat: 18.5204,
  lng: 73.8567,
};

// Get the theme
const theme = getCategoryTheme(hospitalData.category);
// Result: { 
//   color: "#38bdf8", 
//   accentColor: "#06b6d4",
//   emoji: "🏥",
//   label: "Hospital",
//   severity: "high",
//   ...
// }

// Create marker element
const markerElement = create3DMarkerElement(theme, hospitalData.title);

// Use with MapLibre
const marker = new maplibregl.Marker({ element: markerElement })
  .setLngLat([hospitalData.lng, hospitalData.lat])
  .addTo(map);


// ============================================================================
// EXAMPLE 2: Emergency Beacon (Ambulance in Motion)
// ============================================================================

const ambulanceData = {
  id: "amb-001",
  title: "Emergency Ambulance #42",
  category: "live_ambulance",  // ← Pulsing beacon
  lat: 18.5300,
  lng: 73.8600,
};

const ambulanceTheme = getCategoryTheme(ambulanceData.category);
// Result: { 
//   emoji: "🚑",
//   severity: "critical",
//   hasPulse: true,  // ← Will animate!
//   glowColor: "rgba(52, 211, 153, 0.7)",
//   ...
// }

const ambulanceMarker = create3DMarkerElement(ambulanceTheme, ambulanceData.title);
// Result: 3D marker with continuous pulsing animation


// ============================================================================
// EXAMPLE 3: Danger Zone (Critical Pulsing)
// ============================================================================

const dangerZoneData = {
  id: "danger-001",
  title: "Accident Prone Area - NH Route 4",
  category: "danger_zone",  // ← Pulsing critical
  lat: 18.5100,
  lng: 73.8500,
};

const dangerTheme = getCategoryTheme(dangerZoneData.category);
// Result: {
//   color: "#ef4444",  // Red
//   emoji: "⚠️",
//   severity: "critical",
//   icon3dStyle: "pulse",  // ← Expands outward
//   hasPulse: true,
//   ...
// }


// ============================================================================
// EXAMPLE 4: Smart City IoT Device (Blue Purple)
// ============================================================================

const sensorData = {
  id: "sensor-001",
  title: "Traffic Density Sensor",
  category: "sensor_node",  // ← Small dot, no animation
  lat: 18.5250,
  lng: 73.8650,
};

const sensorTheme = getCategoryTheme(sensorData.category);
// Result: {
//   color: "#a78bfa",  // Purple
//   emoji: "📡",
//   severity: "info",
//   icon3dStyle: "dot",  // ← Small, subtle
//   hasPulse: false,
//   ...
// }


// ============================================================================
// EXAMPLE 5: Traffic Jam (Pulsing Red)
// ============================================================================

const trafficData = {
  id: "traffic-001",
  title: "Heavy Traffic - Toll Plaza",
  category: "traffic_jam",  // ← Red, pulsing
  lat: 18.5400,
  lng: 73.8700,
};

const trafficTheme = getCategoryTheme(trafficData.category);
// Result: {
//   color: "#ef4444",  // Red
//   emoji: "🚗",
//   severity: "high",
//   hasPulse: true,  // ← Expands outward
//   ...
// }


// ============================================================================
// EXAMPLE 6: Safe Route (Green, Static)
// ============================================================================

const safeRouteData = {
  id: "route-001",
  title: "Safe Commute Route",
  category: "safe_route",  // ← Green, no animation
  lat: 18.5350,
  lng: 73.8550,
};

const routeTheme = getCategoryTheme(safeRouteData.category);
// Result: {
//   color: "#22c55e",  // Green
//   emoji: "✅",
//   severity: "info",
//   icon3dStyle: "marker",  // ← Static 3D pin
//   hasPulse: false,
//   ...
// }


// ============================================================================
// MAPPING YOUR DUMMY DATA
// ============================================================================

/**
 * Update your dummy data to use new categories:
 * 
 * OLD FORMAT (broken):
 * { 
 *   category: "hospital",
 *   accent: "#38bdf8",      // ← Manual color (outdated)
 *   iconUrl: "/icons/hospital.png"  // ← Manual icon
 * }
 *
 * NEW FORMAT (clean):
 * {
 *   category: "hospital",    // ← That's it!
 *   // Everything else (color, emoji, animation) comes from getCategoryTheme()
 * }
 */


// ============================================================================
// BATCH PROCESSING: Convert All Dummy Data Points
// ============================================================================

function createMarkerForPoint(point) {
  // Auto-detect theme from category (with fallback support)
  const theme = getCategoryTheme(point.category);
  
  // Create 3D marker automatically
  const markerElement = create3DMarkerElement(theme, point.title);
  
  // Create MapLibre marker
  const marker = new maplibregl.Marker({ element: markerElement })
    .setLngLat([point.lng, point.lat])
    .addTo(map);
  
  // Add metadata
  marker.setPopup(new maplibregl.Popup()
    .setHTML(`
      <div class="marker-popup">
        <div class="popup-emoji">${theme.emoji}</div>
        <div class="popup-title">${point.title}</div>
        <div class="popup-label">${theme.label}</div>
        <div class="popup-severity">${theme.severity}</div>
      </div>
    `)
  );
  
  return marker;
}

// Use it
const allPoints = dummyDatabase.points;
const markers = allPoints.map(point => createMarkerForPoint(point));


// ============================================================================
// COMMON CATEGORY REPLACEMENTS
// ============================================================================

/**
 * If your dummy data uses these old categories, they auto-map:
 */

const categoryMappings = {
  // Road Quality → Pothole
  "damaged_road": "pothole",
  "cracked_road": "pothole",
  "broken_road": "pothole",
  
  // Danger → Danger Zone
  "high_risk": "danger_zone",
  "accident_area": "accident_zone",
  
  // Traffic → Traffic
  "slow_traffic": "traffic_jam",
  "vehicle_queue": "traffic_jam",
  
  // Construction → Pothole (infrastructure issues)
  "road_work": "pothole",
  "maintenance": "pothole",
  
  // Smart → IoT Device
  "smart_device": "iot_device",
  "connectivity": "iot_device",
  
  // Legacy fallback
  "other": "safe_zone",
};

// Example: Auto-convert old data
function normalizeCategory(oldCategory) {
  return categoryMappings[oldCategory] || oldCategory;
}


// ============================================================================
// ANIMATION SHOWCASE
// ============================================================================

/**
 * Different animation styles you can expect:
 */

const animationExamples = {
  // Beacon - Continuous pulsing glow (Live Services)
  "live_ambulance": "🚑 Green pulsing glow, urgent",
  "live_police": "🚗 Red pulsing glow, urgent", 
  "ambulance": "🚑 Green pulsing, emergency medical",
  "emergency_call": "☎️ Red pulsing, SOS",
  
  // Pulse - Expanding ring (Danger/Hazards)
  "danger_zone": "⚠️ Red expanding rings",
  "accident_zone": "💥 Red expanding rings",
  "flood_zone": "🌊 Blue expanding rings",
  "traffic_jam": "🚗 Red expanding rings",
  "road_closed": "🚫 Red expanding rings",
  "community_alert": "🔔 Purple expanding rings",
  
  // Marker - Static 3D pin (Standard)
  "hospital": "🏥 Static cyan pin",
  "police": "🚨 Static red pin",
  "fire_station": "🚒 Static orange pin",
  "school_zone": "🏫 Static yellow pin",
  
  // Dot - Subtle small dot (Sensors/Monitoring)
  "cctv": "📷 Purple dot",
  "sensor_node": "📡 Purple dot",
  "iot_device": "📱 Blue dot",
  "dark_spot": "🌑 Gray dot",
};


// ============================================================================
// COLOR REFERENCE
// ============================================================================

const colorLegend = {
  critical: {
    colors: ["#ef4444", "#ff6b6b", "#dc2626", "#991b1b"],
    categories: ["danger_zone", "accident_zone", "sos_point", "road_closed"],
    description: "Red family - Most urgent, requires immediate attention"
  },
  high: {
    colors: ["#f43f5e", "#fb923c", "#fbbf24"],
    categories: ["police", "fire_station", "high_risk_intersection"],
    description: "Red/Orange family - Urgent but non-emergency"
  },
  medium: {
    colors: ["#fbbf24", "#a855f7", "#e879f9"],
    categories: ["traffic", "construction", "police_traffic"],
    description: "Yellow/Purple family - Caution, monitor closely"
  },
  low: {
    colors: ["#22c55e", "#10b981", "#34d399"],
    categories: ["safe_zone", "safe_route", "ambulance_route"],
    description: "Green family - Safe, assistance available"
  },
  info: {
    colors: ["#06b6d4", "#0ea5e9", "#6366f1"],
    categories: ["smart_signal", "sensor_node", "iot_device"],
    description: "Blue/Cyan family - Information & intelligence"
  }
};


// ============================================================================
// HOVER & INTERACTION
// ============================================================================

/**
 * All markers have built-in hover effects:
 * - Scale up 1.08x
 * - Brightness +20%
 * - Smooth 0.3s transition
 * 
 * No extra code needed!
 */

// If you want custom hover behavior:
function addCustomHoverToMarker(markerElement) {
  markerElement.addEventListener("mouseenter", () => {
    // Your custom logic here
    console.log("Hovered on:", markerElement.getAttribute("data-category"));
  });
}


// ============================================================================
// TESTING & DEBUG
// ============================================================================

// List all available categories
function getAllCategories() {
  const { CATEGORY_THEMES } = require("@/utils/markerIcons");
  return Object.keys(CATEGORY_THEMES).sort();
}

// Check if category exists
function isCategoryValid(category) {
  const { CATEGORY_THEMES } = require("@/utils/markerIcons");
  return category in CATEGORY_THEMES;
}

// Get all critical markers
function getCriticalMarkers() {
  const { CATEGORY_THEMES } = require("@/utils/markerIcons");
  return Object.entries(CATEGORY_THEMES)
    .filter(([_, theme]) => theme.severity === "critical")
    .map(([cat, _]) => cat);
}

// Get all pulsing markers
function getPulsingMarkers() {
  const { CATEGORY_THEMES } = require("@/utils/markerIcons");
  return Object.entries(CATEGORY_THEMES)
    .filter(([_, theme]) => theme.hasPulse)
    .map(([cat, _]) => cat);
}


// ============================================================================
// FINAL CHECKLIST
// ============================================================================

/**
 * ✅ Using the new 50+ category system?
 * 
 * [ ] Updated dummy data to use category names
 * [ ] Removed manual accent/icon URL fields
 * [ ] Test with getCategoryTheme() for theme lookup
 * [ ] Verify all markers render with create3DMarkerElement()
 * [ ] Check animations play (critical/pulsing types)
 * [ ] Verify hover effects work
 * [ ] Test on mobile (touch events)
 * [ ] Verify color coding matches severity
 * [ ] Check performance (should be < 100ms for 50 markers)
 */
