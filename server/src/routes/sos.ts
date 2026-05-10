import { Router } from 'express';
import { z } from 'zod';

export const sosRouter = Router();

const bodySchema = z.object({
  message: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  language: z.string().optional(),
});

type NearbyStub = {
  hospitals: Array<{ name: string; distanceKm: number }>;
  ambulances: Array<{ name: string; distanceKm: number; phone: string }>;
  police: Array<{ name: string; distanceKm: number; phone: string }>;
};

const createNearbyStub = (): NearbyStub => ({
  hospitals: [{ name: 'Trauma Center (stub)', distanceKm: 2.4 }],
  ambulances: [{ name: 'Ambulance Unit (stub)', distanceKm: 1.1, phone: '112' }],
  police: [{ name: 'Police Station (stub)', distanceKm: 3.2, phone: '100' }],
});

sosRouter.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { lat, lng, message, language } = parsed.data;

  const normalizedMessage = message?.trim() ?? 'SOS activated';
  const firstAid =
    'First aid (general): keep the injured person still, check breathing, apply pressure to bleeding with clean cloth, and call emergency services if not already done.';

  return res.json({
    ok: true,
    meta: {
      language: language ?? 'en',
      normalizedMessage,
      location: { lat, lng },
    },
    nearby: createNearbyStub(),
    firstAid,
    emergencyContacts: [
      { type: 'Ambulance', number: '112' },
      { type: 'Police', number: '100' },
    ],
  });
});
