import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

export const chatRouter = Router();

// Initialize OpenAI client with fallback
const openaiApiKey = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;

if (openaiApiKey) {
  openaiClient = new OpenAI({
    apiKey: openaiApiKey,
  });
}

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  lat: z.number().optional(),
  lng: z.number().optional(),
  language: z.string().optional(),
});

// System prompt for RoadSoS AI assistant
const SYSTEM_PROMPT = `You are RoadSoS AI, an intelligent emergency and road safety assistant for the BIMSTEC region (South and Southeast Asia: India, Bangladesh, Bhutan, Maldives, Nepal, Sri Lanka, Thailand). Your role is to provide:

1. **Emergency Response**: Detect emergencies and provide immediate guidance
2. **Road Safety**: Real-time traffic, accident, and road hazard information
3. **Traffic Laws**: DriveLegal - provide traffic law information for the user's specific country/state
4. **Citizen Reports**: RoadWatch - encourage and validate citizen-reported road issues
5. **Location Services**: When given coordinates, provide localized advice

**Your Expertise:**
- Emergency protocols and first aid
- Traffic rules for BIMSTEC countries
- Road hazard identification
- Emergency contact numbers by country
- Safe driving practices
- Vehicle compliance information

**Response Style:**
- Direct, actionable advice in emergencies
- Conversational and helpful for regular queries
- Always ask for location (city/state/country) if needed for localized info
- Provide verified emergency numbers and services
- Keep responses concise but comprehensive

**Emergency Keywords**: accident, crash, SOS, help, emergency, injured, unconscious, bleeding, pain, collision, fire, flood, stuck

When emergency is detected, IMMEDIATELY provide:
1. Nearest emergency contact
2. First aid guidance if applicable
3. Safe location awareness
4. Nearby service options`;

async function callOpenAI(message: string, locationInfo: string): Promise<string> {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured');
  }

  const userMessage = locationInfo ? `${message}${locationInfo}` : message;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const textContent = response.choices[0]?.message?.content;
  if (!textContent) {
    throw new Error('No response from OpenAI');
  }

  return textContent;
}

function getFallbackResponse(message: string, isEmergency: boolean, locationHint: string): string {
  if (isEmergency) {
    return `🚨 EMERGENCY DETECTED${locationHint}\n\nImmediate actions:\n1. Call 112 (ambulance) or 100 (police)\n2. Move to safety if possible\n3. I'm retrieving nearby hospitals and emergency services...\n\nYour message: "${message}"\n\nEmergency dispatch system is being activated.`;
  }

  return `Road Safety Assistant here. You asked: "${message}"\n\nTo provide better assistance:\n• Share your location (city/state) or GPS coordinates\n• Tell me the specific road safety concern\n• I can help with: traffic laws (DriveLegal), road hazards (RoadWatch), emergency services, safe driving tips\n\nWhat can I help you with?`;
}

chatRouter.post('/', async (req, res) => {
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

  const parsed = bodySchema.safeParse(parsedBody);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { message, lat, lng, language } = parsed.data;

  const locationHint =
    typeof lat === 'number' && typeof lng === 'number'
      ? ` (Location: ${lat.toFixed(4)}, ${lng.toFixed(4)})`
      : '';

  const isEmergency = /\b(accident|sos|emergency|help|hurt|injur|crash|collision|fire|flood|stuck|bleed|unconscious|pain)\b/i.test(
    message
  );

  let reply: string;

  try {
    // Try to use OpenAI if available
    if (openaiClient) {
      reply = await callOpenAI(message, locationHint);
    } else {
      // Fallback to deterministic responses
      reply = getFallbackResponse(message, isEmergency, locationHint);
    }
  } catch (error) {
    // Graceful fallback if API fails
    console.error('OpenAI API error:', error);
    reply = getFallbackResponse(message, isEmergency, locationHint);
  }

  return res.json({
    reply,
    meta: {
      language: language ?? 'en',
      isEmergency,
      locationProvided: !!(lat && lng),
    },
  });
});
