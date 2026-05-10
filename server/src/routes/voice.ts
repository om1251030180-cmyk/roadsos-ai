import { Router } from 'express';
import { z } from 'zod';
import { ElevenLabsClient } from 'elevenlabs';

export const voiceRouter = Router();

// Initialize ElevenLabs client with fallback
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
let elevenLabsClient: ElevenLabsClient | null = null;

if (elevenLabsApiKey) {
  elevenLabsClient = new ElevenLabsClient({ apiKey: elevenLabsApiKey });
}

const voiceBodySchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional().default('21m00Tcm4TlvDq8ikWAM'), // Rachel - default voice
  language: z.string().optional().default('en'),
});

// Premium voice IDs for different emotions/styles
const VOICE_IDS = {
  emergency: '2EiwWnXFnvU5JabPnLnl', // Professional, urgent
  professional: '21m00Tcm4TlvDq8ikWAM', // Rachel - friendly, professional
  friendly: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, conversational
  calm: 'iP3nQnzvtqwJsKZ1OXE5', // Charlie - calm, soothing
  authoritative: 'AZnzlk1cXrUIjQrXL5Oy', // Sam - strong, authoritative
};

voiceRouter.post('/', async (req, res) => {
  const rawBody = req.body as unknown;

  const parsedBody =
    typeof rawBody === 'string'
      ? (() => {
          try {
            return JSON.parse(rawBody) as unknown;
          } catch {
            return undefined;
          }
        })()
      : rawBody;

  const parsed = voiceBodySchema.safeParse(parsedBody);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { text, voiceId, language } = parsed.data;

  // Check if we have API key
  if (!elevenLabsClient || !elevenLabsApiKey) {
    return res.status(503).json({
      error: 'Voice synthesis service unavailable',
      message: 'ELEVENLABS_API_KEY not configured',
    });
  }

  try {
    // Generate audio using ElevenLabs API
    const audioStream = await elevenLabsClient.generate({
      voice: voiceId,
      text,
      model_id: 'eleven_monolingual_v1',
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    // Return audio as base64 data URL for easy playback
    const base64Audio = audioBuffer.toString('base64');
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return res.json({
      ok: true,
      audio: dataUrl,
      meta: {
        voiceId,
        language,
        textLength: text.length,
        duration: Math.round((text.length / 5) * 1000), // Rough estimate: 5 chars per second
      },
    });
  } catch (error) {
    console.error('ElevenLabs API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific error cases
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid ELEVENLABS_API_KEY',
      });
    }

    if (errorMessage.includes('429')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to ElevenLabs API',
      });
    }

    return res.status(500).json({
      error: 'Voice synthesis failed',
      message: errorMessage,
    });
  }
});

// Health check endpoint
voiceRouter.get('/health', (_req, res) => {
  const isConfigured = !!elevenLabsClient;

  return res.json({
    ok: true,
    voiceSynthesis: {
      available: isConfigured,
      apiKeyConfigured: isConfigured,
      availableVoices: Object.keys(VOICE_IDS),
    },
  });
});

// List available voice IDs
voiceRouter.get('/voices', (_req, res) => {
  return res.json({
    ok: true,
    voices: [
      { id: VOICE_IDS.emergency, name: 'Emergency (Professional)', use: 'Urgent alerts' },
      { id: VOICE_IDS.professional, name: 'Professional (Rachel)', use: 'Standard responses' },
      { id: VOICE_IDS.friendly, name: 'Friendly (Bella)', use: 'Casual conversation' },
      { id: VOICE_IDS.calm, name: 'Calm (Charlie)', use: 'Soothing, relaxed' },
      { id: VOICE_IDS.authoritative, name: 'Authoritative (Sam)', use: 'Instructions, commands' },
    ],
  });
});
