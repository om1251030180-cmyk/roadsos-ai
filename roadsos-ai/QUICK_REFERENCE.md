# RoadSoS AI - Map-First Redesign Quick Reference

## 🗺️ Architecture Overview

```
USER INTERFACE LAYER (z-index hierarchy)
═══════════════════════════════════════════════════════════════

z-70  ┌─────────────────────────────────────────┐
      │    Emergency Systems & Overlays        │
      │  - CinematicEmergency                  │
      │  - SmartCityOverlays                   │
      └─────────────────────────────────────────┘

z-50  ┌─────────────────────────────────────────┐
      │  Floating Mini Controls                 │
      │  - Auto-hiding (hideDelay: 3-4s)       │
      │  - Position: top-left, top-right, etc  │
      │  - 12x12px compact normally             │
      └─────────────────────────────────────────┘

z-40  ┌─────────────────────────────────────────┐
      │  Map Layer Manager                      │
      │  - Bottom right, expandable             │
      │  - 11 layer toggles                    │
      │  - Auto-hide when inactive              │
      └─────────────────────────────────────────┘

z-30  ┌─────────────────────────────────────────┐
      │  Contextual Popups                      │
      │  - Appear near markers on click        │
      │  - 300ms entrance animation            │
      │  - Floating shadow & glassmorphism     │
      │  - Quick action buttons                │
      └─────────────────────────────────────────┘
      │                                         │
      │  Compact Assistant (Draggable)          │
      │  - Floating orb (16x16)                │
      │  - Bottom right corner                  │
      │  - Drag to reposition                   │
      │  - Expands on interaction               │
      └─────────────────────────────────────────┘

z-20  ┌─────────────────────────────────────────┐
      │  Minimal UI Elements                    │
      │  - Brand indicator (top-left)          │
      │  - Network status (top-right)          │
      │  - Live stats card (bottom-left)       │
      └─────────────────────────────────────────┘

z-10  ┌─────────────────────────────────────────┐
      │  Smart Map Labels                       │
      │  - Embedded directly on map            │
      │  - Dynamic zoom scaling                │
      │  - 5 label types                        │
      │  - Pulsing for alerts                   │
      └─────────────────────────────────────────┘

z-5   ┌─────────────────────────────────────────┐
      │  Cinematic Effects                      │
      │  - Noise layer (opacity: 0.14)         │
      │  - Scanline animation (7s)             │
      └─────────────────────────────────────────┘

z-0   ┌─────────────────────────────────────────┐
      │    ████ PRIMARY MAP ████               │
      │                                         │
      │  - MapLibre GL renderer                │
      │  - User location marker (blue orb)    │
      │  - All data layers                     │
      │  - Interactive & responsive            │
      │  - Map is the MAIN INTERFACE           │
      └─────────────────────────────────────────┘
```

## 📦 Component Dependency Tree

```
App (page.tsx)
├── MapView (z-0, PRIMARY)
│   └── SmartLocationMarker (animated blue orb)
│
├── SmartMapLabels (z-10)
│   ├── Danger zones → Red, pulsing
│   ├── Services → Green, static
│   ├── Alerts → Red, animated
│   └── Routes → Blue, flowing
│
├── SmartCityOverlays (z-5)
│   └── Animated effects layer
│
├── CinematicEmergency (z-70)
│   └── Emergency state management
│
├── FloatingMiniControls (z-50)
│   ├── Locate Me
│   ├── Emergency Mode
│   ├── Traffic Toggle
│   ├── Layers
│   └── Settings
│
├── MapLayerManager (z-40, expandable)
│   ├── Hospitals
│   ├── Ambulances
│   ├── Police
│   ├── Risk Zones
│   ├── Traffic
│   ├── Flood
│   ├── Construction
│   ├── Road Quality
│   ├── Safe Routes
│   ├── CCTV
│   └── Night Safety
│
├── ContextualPopup (z-30, on-demand)
│   ├── Hospital Popup
│   ├── Accident Popup
│   ├── Road Popup
│   ├── Service Popup
│   └── Alert Popup
│
└── CompactAssistant (z-30, draggable)
    ├── Chat Interface
    ├── Voice Input
    ├── Message History
    └── Emergency Detection
```

## 🎨 Color-Coding Reference

| Type         | Color         | RGB               | Use Case                |
| ------------ | ------------- | ----------------- | ----------------------- |
| **Primary**  | Cyan          | `#22d3ee`         | Main interaction, focus |
| **Safe**     | Emerald       | `#10b981`         | Safe routes, positive   |
| **Danger**   | Red           | `#ef4444`         | Danger zones, urgent    |
| **Warning**  | Amber         | `#f59e0b`         | Caution, construction   |
| **Traffic**  | Yellow→Orange | `#f59e0b→#f97316` | Traffic density         |
| **Hospital** | Blue→Cyan     | `#3b82f6→#22d3ee` | Medical services        |
| **Police**   | Red→Orange    | `#ef4444→#f97316` | Law enforcement         |
| **Flood**    | Blue→Indigo   | `#3b82f6→#4f46e5` | Water hazards           |

## ⏱️ Animation Reference

| Animation          | Duration | Loop | Effect               |
| ------------------ | -------- | ---- | -------------------- |
| Location Orb Glow  | 2.5s     | ∞    | Pulse effect         |
| Map Breathing      | 4s       | ∞    | Subtle brightness    |
| Danger Glow        | 1.5s     | ∞    | Pulsing danger zones |
| Route Flow         | 3s       | ∞    | Flowing energy       |
| Popup Appear       | 300ms    | Once | Entrance animation   |
| Mini Controls Hide | 400ms    | Once | Auto-hide fade       |
| Label Fade         | 400ms    | Once | Zoom transition      |
| Holographic Wave   | 2s       | ∞    | Wave effect          |
| Ambient Glow       | 3s       | ∞    | Active layer glow    |
| Zoom Transition    | 400ms    | Once | Smooth zoom          |

## 🔧 Component API Quick Reference

### SmartLocationMarker

```tsx
<SmartLocationMarker
  lat={number}
  lng={number}
  accuracy={number} // in meters
  heading={number} // 0-360 degrees
  isActive={boolean}
/>
```

### MapLayerManager

```tsx
<MapLayerManager
  activeLayers={MapLayer[]}
  onLayerToggle={(layer) => void}
  compact={boolean}
/>
```

### ContextualPopup

```tsx
<ContextualPopup
  data={PopupData | null}
  position={{ x: number, y: number }}
  isOpen={boolean}
  onClose={() => void}
  onActionClick={(index: number) => void}
/>
```

### SmartMapLabels

```tsx
<SmartMapLabels
  labels={MapLabel[]}
  mapZoom={number}
  onLabelClick={(label: MapLabel) => void}
/>
```

### FloatingMiniControls

```tsx
<FloatingMiniControls
  controls={ControlItem[]}
  position="top-left" | "top-right" | "bottom-left" | "bottom-right"
  autoHide={boolean}
  hideDelay={number}    // milliseconds
/>
```

### CompactAssistant

```tsx
<CompactAssistant />
```

### AnimatedRouteVisualization

```tsx
<AnimatedRouteVisualization
  routes={Route[]}
  containerWidth={number}
  containerHeight={number}
  viewBox={string}
/>
```

## 🎯 Use Case Examples

### "I need to find a hospital fast"

1. User clicks CompactAssistant orb
2. Says/types "Emergency, find hospital"
3. Emergency mode activates → RED
4. Hospitals layer auto-activated
5. Hospital markers glow with green availability
6. Closest hospital highlighted
7. ContextualPopup shows ETA & call button
8. User clicks "Navigate" or "Call"

### "Show me safe routes"

1. User clicks route icon in mini controls
2. MapLayerManager opens
3. User toggles "Safe Routes" layer
4. Blue glowing routes appear
5. Routes animate with flowing energy
6. SmartMapLabels show route info
7. User clicks route → ContextualPopup details

### "What's happening on Main Street?"

1. User zooms to Main Street
2. SmartMapLabels appear for that area
3. Road quality color shows condition
4. Traffic flow visualization shows movement
5. Any incidents show as pulsing alerts
6. Construction zones show striped pattern

## 📱 Responsive Breakpoints

| Breakpoint  | Size       | Behavior                                             |
| ----------- | ---------- | ---------------------------------------------------- |
| **Mobile**  | < 768px    | Compact controls, touch-optimized, simplified popups |
| **Tablet**  | 768-1023px | Medium controls, easier touch, balanced layout       |
| **Desktop** | ≥ 1024px   | Full features, expanded on hover, animations full    |

## 🚀 Performance Targets

- **FPS:** 60fps (all animations)
- **Popup Delay:** 300ms max
- **Layer Toggle:** Instant
- **Mobile FCP:** < 2s
- **Mobile TTI:** < 3s
- **Bundle Size:** < 500KB

## 📊 File Structure

```
components/
├── MapView/
│   └── MapView.tsx                    (map rendering)
│
├── SmartLocationMarker/
│   └── SmartLocationMarker.tsx        (blue orb)
│
├── MapLayerManager/
│   └── MapLayerManager.tsx            (layer toggles)
│
├── ContextualPopup/
│   └── ContextualPopup.tsx            (mini popups)
│
├── SmartMapLabels/
│   └── SmartMapLabels.tsx             (embedded labels)
│
├── FloatingMiniControls/
│   └── FloatingMiniControls.tsx       (compact controls)
│
├── CompactAssistant/
│   └── CompactAssistant.tsx           (AI orb)
│
└── AnimatedRouteVisualization/
    └── AnimatedRouteVisualization.tsx (route animation)
```

## 🔑 Key Principles

1. **Map-First**: Map is PRIMARY, everything else SUPPORTS
2. **Minimal**: Only show what's needed, hide the rest
3. **Smart**: Context-aware popups, intelligent labels
4. **Alive**: Everything animates smoothly, feels responsive
5. **Beautiful**: Glassmorphism, glowing effects, smooth curves
6. **Accessible**: Keyboard nav, screen readers, high contrast

## 🎬 Example Flow

```
User opens app
    ↓
Map loads with subtle breathing animation
    ↓
Location marker appears (animated blue orb)
    ↓
Minimal brand/status indicators visible
    ↓
Smart labels appear on map (hospitals, dangers, etc)
    ↓
Mini controls visible on hover (top-right)
    ↓
Layer manager visible on hover (bottom-right)
    ↓
User clicks marker
    ↓
ContextualPopup appears near marker (smooth animation)
    ↓
User clicks action (Navigate, Call, etc)
    ↓
Appropriate response triggered
    ↓
Popup closes/stays as needed
    ↓
Map remains primary interactive element
```

---

**Quick Links:**

- [Comprehensive Design Doc](MAP_FIRST_REDESIGN.md)
- [Component Usage Guide](COMPONENT_USAGE_GUIDE.md)
- [Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)

**Last Updated:** May 10, 2026
**Design Version:** 2.0 (Map-First)
**Status:** 🎉 Complete & Production Ready
