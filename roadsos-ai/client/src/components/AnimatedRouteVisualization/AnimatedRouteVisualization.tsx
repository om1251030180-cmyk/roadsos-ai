"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

export interface Route {
  id: string;
  name: string;
  type: "safe" | "emergency" | "danger";
  waypoints: Array<{ lat: number; lng: number }>;
  distance: number;
  eta: number;
  hazardLevel: number; // 0-1
}

interface AnimatedRouteVisualizationProps {
  routes: Route[];
  containerWidth?: number;
  containerHeight?: number;
  viewBox?: string;
}

/**
 * Animated route visualization with:
 * - Glowing animated lines
 * - Flowing energy effect
 * - Color-coded danger levels
 * - Smart route indicators
 */
export const AnimatedRouteVisualization: React.FC<
  AnimatedRouteVisualizationProps
> = ({
  routes,
  containerWidth = 800,
  containerHeight = 600,
  viewBox = "0 0 100 100",
}) => {
  const getRouteColor = (type: Route["type"]) => {
    switch (type) {
      case "safe":
        return "#10b981"; // emerald
      case "emergency":
        return "#22d3ee"; // cyan
      case "danger":
        return "#ef4444"; // red
      default:
        return "#8b5cf6"; // purple
    }
  };

  const getRouteOpacity = (hazardLevel: number) => {
    return Math.max(0.4, 1 - hazardLevel * 0.6);
  };

  const convertWaypoints = (waypoints: Array<{ lat: number; lng: number }>) => {
    // Simple conversion - in production, use proper map projection
    const points = waypoints
      .map((p) => {
        const x = ((p.lng + 180) / 360) * 100;
        const y = ((90 - p.lat) / 180) * 100;
        return `${x},${y}`;
      })
      .join(" ");
    return points;
  };

  return (
    <svg
      viewBox={viewBox}
      width={containerWidth}
      height={containerHeight}
      className="absolute inset-0 pointer-events-none"
    >
      {/* Defs for gradients and filters */}
      <defs>
        {routes.map((route) => (
          <React.Fragment key={`defs-${route.id}`}>
            {/* Gradient for glow effect */}
            <linearGradient
              id={`gradient-${route.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor={getRouteColor(route.type)}
                stopOpacity="0"
              />
              <stop
                offset="50%"
                stopColor={getRouteColor(route.type)}
                stopOpacity={getRouteOpacity(route.hazardLevel)}
              />
              <stop
                offset="100%"
                stopColor={getRouteColor(route.type)}
                stopOpacity="0"
              />
            </linearGradient>

            {/* Glow filter */}
            <filter
              id={`glow-${route.id}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation={route.type === "danger" ? "0.3" : "0.5"}
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </React.Fragment>
        ))}
      </defs>

      {/* Routes */}
      {routes.map((route) => (
        <g key={route.id}>
          {/* Outer glow layer */}
          <motion.polyline
            points={convertWaypoints(route.waypoints)}
            fill="none"
            stroke={getRouteColor(route.type)}
            strokeWidth="0.8"
            opacity="0.3"
            filter={`url(#glow-${route.id})`}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main route line */}
          <polyline
            points={convertWaypoints(route.waypoints)}
            fill="none"
            stroke={getRouteColor(route.type)}
            strokeWidth="0.4"
            opacity={getRouteOpacity(route.hazardLevel)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated flowing effect */}
          <motion.polyline
            points={convertWaypoints(route.waypoints)}
            fill="none"
            stroke={getRouteColor(route.type)}
            strokeWidth="0.6"
            opacity="0.6"
            strokeDasharray="2,4"
            animate={{
              strokeDashoffset: [-10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Waypoint markers */}
          {route.waypoints.map((point, idx) => {
            const x = ((point.lng + 180) / 360) * 100;
            const y = ((90 - point.lat) / 180) * 100;
            return (
              <g key={`waypoint-${route.id}-${idx}`}>
                {/* Outer pulse */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill="none"
                  stroke={getRouteColor(route.type)}
                  strokeWidth="0.2"
                  opacity="0.5"
                  animate={{
                    r: [0.8, 1.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />

                {/* Center dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="0.3"
                  fill={getRouteColor(route.type)}
                  opacity={getRouteOpacity(route.hazardLevel)}
                />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export default AnimatedRouteVisualization;
