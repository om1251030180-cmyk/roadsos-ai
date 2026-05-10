# RoadSoS AI - Component Usage Guide

## Quick Start Examples

### 1. Basic Map-First Page Setup

```tsx
"use client";

import MapView from "@/components/MapView/MapView";
import { MapLayerManager } from "@/components/MapLayerManager/MapLayerManager";
import { ContextualPopup } from "@/components/ContextualPopup/ContextualPopup";
import { CompactAssistant } from "@/components/CompactAssistant/CompactAssistant";
import { FloatingMiniControls } from "@/components/FloatingMiniControls/FloatingMiniControls";
import { SmartMapLabels } from "@/components/SmartMapLabels/SmartMapLabels";

export default function MapFirst() {
  const [activeLayers, setActiveLayers] = useState(["hospitals", "ambulances"]);
  const [popup, setPopup] = useState(null);

  return (
    <main className="w-full h-screen relative">
      {/* Map is primary */}
      <MapView />

      {/* Map labels embedded */}
      <SmartMapLabels labels={mapLabels} mapZoom={12} />

      {/* Layer controls */}
      <MapLayerManager
        activeLayers={activeLayers}
        onLayerToggle={setActiveLayers}
      />

      {/* Popups appear on demand */}
      <ContextualPopup
        data={popup}
        isOpen={popup !== null}
        onClose={() => setPopup(null)}
      />

      {/* Mini controls auto-hide */}
      <FloatingMiniControls controls={miniControls} />

      {/* AI assistant draggable */}
      <CompactAssistant />
    </main>
  );
}
```

### 2. Hospital Visualization

```tsx
// Display hospital on map with contextual popup

const hospitalMarker = {
  lat: 18.52,
  lng: 73.85,
  name: "City Trauma Center",
  distance: "2.3 km",
  eta: "8 min",
  status: "Open - 2 beds available",
  rating: "4.9/5",
  phone: "+91-XXXX-XXXX",
  services: "24/7 Emergency, Trauma Surgery, ICU",
  icon: "🏥",
  type: "hospital",
};

const hospitalLabel = {
  id: "hospital-1",
  text: "Trauma Center",
  lat: 18.52,
  lng: 73.85,
  type: "service",
  intensity: 0.8,
  pulsing: false,
};

// When user clicks hospital marker:
const handleHospitalClick = () => {
  setPopup({
    title: hospitalMarker.name,
    type: "hospital",
    icon: hospitalMarker.icon,
    primaryInfo: [
      {
        label: "Distance",
        value: hospitalMarker.distance,
        color: "text-cyan-300",
      },
      { label: "ETA", value: hospitalMarker.eta, color: "text-emerald-300" },
      { label: "Beds Available", value: "2", color: "text-green-300" },
      {
        label: "Rating",
        value: hospitalMarker.rating,
        color: "text-amber-300",
      },
    ],
    secondaryInfo: [
      { label: "Phone", value: hospitalMarker.phone },
      { label: "Services", value: hospitalMarker.services },
    ],
    actions: [
      {
        label: "Navigate",
        icon: "🗺️",
        onClick: () => navigateTo(hospitalMarker),
        color: "bg-blue-500/40 hover:bg-blue-500/60 text-blue-100",
      },
      {
        label: "Call",
        icon: "📞",
        onClick: () => callNumber(hospitalMarker.phone),
        color: "bg-green-500/40 hover:bg-green-500/60 text-green-100",
      },
    ],
    distance: 2.3,
    eta: 8,
  });
};
```

### 3. Accident-Prone Area Visualization

```tsx
// Display danger zone with pulsing effect

const dangerZone = {
  id: "danger-zone-1",
  name: "Highway 101 Intersection",
  lat: 18.51,
  lng: 73.84,
  type: "danger",
  intensity: 0.95, // 95% hazard level
  incidentFrequency: "12 incidents/month",
  peakHours: "7-9 AM, 5-7 PM",
  recommendation: "Avoid peak hours - use alternate route",
  accidents: "42 this year",
  severityScore: 8.5,
};

const dangerLabel = {
  id: "danger-1",
  text: "High Accident Zone",
  lat: dangerZone.lat,
  lng: dangerZone.lng,
  type: "danger",
  intensity: dangerZone.intensity,
  pulsing: true, // Critical alert
};

// When clicked, show danger details:
const handleDangerZoneClick = () => {
  setPopup({
    title: dangerZone.name,
    type: "accident",
    icon: "⚠️",
    primaryInfo: [
      {
        label: "Hazard Level",
        value: `${Math.round(dangerZone.intensity * 100)}%`,
        color: "text-red-300",
      },
      { label: "Incidents/Month", value: "12", color: "text-orange-300" },
      { label: "Peak Hours", value: "7-9 AM, 5-7 PM", color: "text-amber-300" },
      { label: "Severity Score", value: "8.5/10", color: "text-red-400" },
    ],
    secondaryInfo: [
      { label: "Annual Accidents", value: dangerZone.accidents },
      { label: "AI Recommendation", value: dangerZone.recommendation },
    ],
    actions: [
      {
        label: "Avoid Zone",
        icon: "🚫",
        onClick: () => setAvoidRoute(dangerZone),
        color: "bg-red-500/40 hover:bg-red-500/60 text-red-100",
      },
      {
        label: "Safe Route",
        icon: "✅",
        onClick: () => showSafeRoute(dangerZone),
        color: "bg-green-500/40 hover:bg-green-500/60 text-green-100",
      },
    ],
  });
};
```

### 4. Road Quality Visualization

```tsx
// Color-coded road segments

const roadSegments = [
  {
    id: "road-1",
    segment: "Main Street (0-2 km)",
    quality: 0.95, // 95% quality (green)
    condition: "Excellent",
    potholes: 0,
    maintenanceStatus: "Recently paved",
  },
  {
    id: "road-2",
    segment: "5th Avenue (0-1.5 km)",
    quality: 0.65, // 65% quality (yellow)
    condition: "Fair",
    potholes: 3,
    maintenanceStatus: "Due for repair",
  },
  {
    id: "road-3",
    segment: "Highway 42 (exit area)",
    quality: 0.35, // 35% quality (red)
    condition: "Poor",
    potholes: 8,
    maintenanceStatus: "Urgent repair needed",
  },
];

// Road colors based on quality
const getRoadColor = (quality) => {
  if (quality > 0.75) return "#10b981"; // Green - excellent
  if (quality > 0.5) return "#f59e0b"; // Yellow - fair
  return "#ef4444"; // Red - poor
};

// Smart labels for roads
const roadLabels = roadSegments.map((road) => ({
  id: road.id,
  text: `${road.condition} Road Condition`,
  lat: road.lat,
  lng: road.lng,
  type: road.quality > 0.75 ? "info" : road.quality > 0.5 ? "alert" : "danger",
  intensity: 1 - road.quality,
  pulsing: road.quality < 0.5,
}));
```

### 5. Traffic Visualization

```tsx
// Live traffic flow animation

const trafficSegments = [
  {
    id: "traffic-1",
    segment: "Main Street",
    density: 0.2, // Light (20%)
    speed: "45 km/h",
    status: "Light",
    eta: "5 min",
  },
  {
    id: "traffic-2",
    segment: "5th Avenue",
    density: 0.75, // Heavy (75%)
    speed: "15 km/h",
    status: "Heavy",
    eta: "25 min",
  },
];

// Traffic layer animation
// Lines glow more intensely with higher density
// Red for heavy traffic, yellow for moderate, green for light

const trafficColors = {
  light: { color: "#10b981", opacity: 0.4 }, // Green
  moderate: { color: "#f59e0b", opacity: 0.6 }, // Yellow
  heavy: { color: "#ef4444", opacity: 0.8 }, // Red
};

const getTrafficColor = (density) => {
  if (density < 0.4) return trafficColors.light;
  if (density < 0.7) return trafficColors.moderate;
  return trafficColors.heavy;
};
```

### 6. Safe Routes Visualization

```tsx
// AI-recommended safe routes with flowing animation

const safeRoute = {
  id: "route-safe",
  name: "Safest Route to Hospital",
  type: "safe",
  waypoints: [
    { lat: 18.52, lng: 73.85 },
    { lat: 18.525, lng: 73.86 },
    { lat: 18.53, lng: 73.85 },
  ],
  distance: 5.2,
  eta: 12,
  hazardLevel: 0.15, // 15% hazard (low)
  avoidedZones: ["Highway 101 Intersection", "5th Avenue Heavy Traffic"],
  avgSpeed: "35 km/h",
};

const emergencyRoute = {
  id: "route-emergency",
  name: "Emergency Fast Route",
  type: "emergency",
  waypoints: [
    { lat: 18.52, lng: 73.85 },
    { lat: 18.53, lng: 73.87 },
  ],
  distance: 3.8,
  eta: 6,
  hazardLevel: 0.25,
  features: "Shortest distance, bypasses traffic",
};

const dangerRoute = {
  id: "route-danger",
  name: "Not Recommended",
  type: "danger",
  waypoints: [
    { lat: 18.52, lng: 73.85 },
    { lat: 18.48, lng: 73.82 },
  ],
  distance: 4.5,
  eta: 18,
  hazardLevel: 0.85, // 85% hazard (very dangerous)
  reason: "Passes through multiple danger zones and flood areas",
};

// Route visualization
const routes = [safeRoute, emergencyRoute, dangerRoute];

// Animate safe route with flowing effect
// Color: Green for safe, cyan for emergency, red for danger
// Glow intensity: Higher for routes AI recommends
```

### 7. Mini Controls Setup

```tsx
// Auto-hiding mini controls

const controls = [
  {
    id: "locate",
    icon: "📍",
    label: "Find Me",
    onClick: () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude]);
      });
    },
  },
  {
    id: "emergency",
    icon: "🚨",
    label: "Emergency Mode",
    onClick: () => {
      setEmergencyMode(true);
      activateLayers(["hospitals", "ambulances", "police"]);
    },
  },
  {
    id: "traffic",
    icon: "🚦",
    label: "Show Traffic",
    onClick: () => {
      toggleLayer("traffic");
    },
  },
  {
    id: "layers",
    icon: "🗺️",
    label: "Map Layers",
    onClick: () => {
      // Opens full layer manager
    },
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "Settings",
    onClick: () => {
      setShowSettings(true);
    },
  },
];

// In component:
<FloatingMiniControls
  controls={controls}
  position="top-right"
  autoHide={true}
  hideDelay={4000} // Hide after 4 seconds of inactivity
/>;
```

### 8. CompactAssistant Integration

```tsx
// AI assistant with chat and voice

// Example emergency detection
const messages = [
  { role: "user", text: "There's an accident ahead!" },
  {
    role: "assistant",
    text: "Emergency detected. Locating nearest hospital...",
    isEmergency: true,
  },
];

// The CompactAssistant handles:
// - Speech recognition
// - Text input
// - API calls to backend
// - Emergency escalation
// - Route suggestions
// - Service location

// Usage: Just place the component
<CompactAssistant />;
```

### 9. Smart Map Labels Configuration

```tsx
const mapLabels = [
  // Danger zones
  {
    id: "danger-1",
    text: "High Accident Zone",
    lat: 18.52,
    lng: 73.85,
    type: "danger",
    intensity: 0.9,
    pulsing: true,
  },
  // Services
  {
    id: "hospital-1",
    text: "Trauma Center - 2.3 km",
    lat: 18.53,
    lng: 73.86,
    type: "service",
    intensity: 0.7,
    pulsing: false,
  },
  // Alerts
  {
    id: "alert-1",
    text: "Road Construction",
    lat: 18.51,
    lng: 73.84,
    type: "alert",
    intensity: 0.6,
    pulsing: false,
  },
  // Routes
  {
    id: "route-1",
    text: "Safe Route Available",
    lat: 18.52,
    lng: 73.87,
    type: "route",
    intensity: 0.5,
    pulsing: false,
  },
];

// Labels scale and fade with zoom level
// Labels avoid overlapping
// Hover to see full text
```

### 10. Contextual Popup Examples

```tsx
// Hospital Popup
const hospitalPopup = {
  title: "City Trauma Center",
  type: "hospital",
  icon: "🏥",
  primaryInfo: [
    { label: "Distance", value: "2.3 km", color: "text-cyan-300" },
    { label: "ETA", value: "8 min", color: "text-emerald-300" },
    { label: "Beds", value: "2 available", color: "text-green-300" },
    { label: "Rating", value: "4.9/5", color: "text-amber-300" },
  ],
  secondaryInfo: [
    { label: "Phone", value: "+91-XXXX-XXXX" },
    { label: "24/7 Emergency Surgery", value: "ICU: 5 beds" },
  ],
  actions: [
    {
      label: "Navigate",
      icon: "🗺️",
      onClick: () => {},
      color: "bg-blue-500/40 hover:bg-blue-500/60",
    },
    {
      label: "Call",
      icon: "📞",
      onClick: () => {},
      color: "bg-green-500/40 hover:bg-green-500/60",
    },
  ],
};

// Police Station Popup
const policePopup = {
  title: "Downtown Police Station",
  type: "service",
  icon: "🚨",
  primaryInfo: [
    { label: "Distance", value: "1.8 km", color: "text-red-300" },
    { label: "ETA", value: "6 min", color: "text-emerald-300" },
    { label: "Availability", value: "Full", color: "text-green-300" },
    { label: "Response", value: "4 min avg", color: "text-amber-300" },
  ],
  secondaryInfo: [
    { label: "Emergency", value: "100" },
    { label: "Services", value: "24/7 Law Enforcement" },
  ],
  actions: [
    {
      label: "Report",
      icon: "📝",
      onClick: () => {},
      color: "bg-orange-500/40 hover:bg-orange-500/60",
    },
    {
      label: "Navigate",
      icon: "🗺️",
      onClick: () => {},
      color: "bg-blue-500/40 hover:bg-blue-500/60",
    },
  ],
};
```

## Performance Tips

1. **Limit active layers** - Only show layers needed
2. **Debounce popups** - Wait 200ms before showing popups
3. **Virtualize labels** - Only render labels in viewport
4. **Cache marker data** - Store marker positions locally
5. **Lazy load routes** - Load routes only when needed
6. **Reduce animation intensity** - On mobile/low-end devices

## Troubleshooting

### Popups not showing

- Check z-index values
- Verify position calculation
- Ensure data is not null

### Labels overlapping

- Adjust font size
- Use smart label collision detection
- Increase map zoom threshold

### Animations stuttering

- Enable GPU acceleration (transform/opacity)
- Reduce animation complexity
- Check device performance

### Auto-hide not working

- Verify timeout value
- Check mouse event listeners
- Ensure container hover state

---

**Last Updated:** 2024
**Version:** 1.0
