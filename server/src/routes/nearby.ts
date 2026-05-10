import { Router } from 'express';
import { z } from 'zod';

export const nearbyRouter = Router();

const bodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().min(100).max(50000).optional(),
  categories: z
    .array(z.enum(['hospitals', 'ambulances', 'police']))
    .optional(),
});

type NearbyResult = {
  hospitals: Array<{ name: string; distanceKm: number }>;
  ambulances: Array<{ name: string; distanceKm: number; phone: string }>;
  police: Array<{ name: string; distanceKm: number; phone: string }>;
  riskZones: Array<{
    id: string;
    title: string;
    level: 'low' | 'medium' | 'high';
    accidentsPerYear: number;
    reason: string;
  }>;
  constructionZones: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  crowdZones: Array<{
    id: string;
    title: string;
    level: 'low' | 'medium' | 'high';
    crowdScore: number;
    reason: string;
  }>;
};

const createNearbyStub = (categories: Set<string>, distanceFactor: number, lat: number, lng: number): NearbyResult => {
  const hospitals = categories.has('hospitals')
    ? [{ name: 'Trauma Center (stub)', distanceKm: 2.4 * distanceFactor }]
    : [];

  const ambulances = categories.has('ambulances')
    ? [{ name: 'Ambulance Unit (stub)', distanceKm: 1.1 * distanceFactor, phone: '112' }]
    : [];

  const police = categories.has('police')
    ? [{ name: 'Police Station (stub)', distanceKm: 3.2 * distanceFactor, phone: '100' }]
    : [];

  // Deterministic “geometry-like” zones centered around user coords.
  // Frontend will render these as circles/overlays with popups.
  const riskZones = [
    {
      id: 'risk-1',
      title: 'Accident-prone bend (stub)',
      level: 'high' as const,
      accidentsPerYear: Math.round(18 * distanceFactor),
      reason: 'Frequent hard braking + sharp curve + poor visibility.',
    },
    {
      id: 'risk-2',
      title: 'Night unsafe stretch (stub)',
      level: 'medium' as const,
      accidentsPerYear: Math.round(9 * distanceFactor),
      reason: 'Low lighting + pedestrian crossings.',
    },
  ];

  const constructionZones = [
    {
      id: 'cons-1',
      title: 'Construction / road work ahead (stub)',
      severity: 'high' as const,
      reason: 'Lane narrowing + unexpected diversions.',
    },
    {
      id: 'cons-2',
      title: 'Ongoing repairs (stub)',
      severity: 'medium' as const,
      reason: 'Uneven surface + potholes.',
    },
  ];

  const crowdZones = [
    {
      id: 'crowd-1',
      title: 'Most crowded junction (stub)',
      level: 'high' as const,
      crowdScore: Math.round(92 * distanceFactor),
      reason: 'Peak commuting + frequent turning vehicles.',
    },
    {
      id: 'crowd-2',
      title: 'Event-area congestion (stub)',
      level: 'medium' as const,
      crowdScore: Math.round(63 * distanceFactor),
      reason: 'Temporary crowd inflow + slow traffic.',
    },
  ];

  // Use lat/lng so response differs per location (still stub).
  const locationSalt = Math.abs(Math.floor(lat * 1000 + lng * 1000)) % 10;
  riskZones[0].accidentsPerYear += locationSalt;
  crowdZones[0].crowdScore = Math.min(100, crowdZones[0].crowdScore + locationSalt);

  return {
    hospitals,
    ambulances,
    police,
    riskZones,
    constructionZones,
    crowdZones,
  };
};

nearbyRouter.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { lat, lng, radiusMeters, categories } = parsed.data;

  const selected = new Set(categories ?? ['hospitals', 'ambulances', 'police']);
  const radius = radiusMeters ?? 5000;

  const distanceFactor = Math.max(0.5, Math.min(2, radius / 5000));

  const result = createNearbyStub(selected, distanceFactor, lat, lng);

  return res.json({
    ok: true,
    meta: {
      location: { lat, lng },
      radiusMeters: radius,
    },
    nearby: result,
  });
});
