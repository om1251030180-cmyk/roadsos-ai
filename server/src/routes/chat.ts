import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

export const chatRouter = Router();

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;

if (openaiApiKey) {
  openaiClient = new OpenAI({
    apiKey: openaiApiKey,
  });
}

// In-memory conversation memory (in production, use Redis or database)
const conversationMemory = new Map<string, Array<{ role: string; content: string }>>();

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  mode: z.enum(['companion', 'law', 'report']).optional().default('companion'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  language: z.string().optional().default('en'),
  userId: z.string().optional(),
});

// System prompts for different modes
const SYSTEM_PROMPTS: Record<string, string> = {
  companion: `You are RoadSoS AI Neural Guide, an intelligent emergency and road safety companion for the BIMSTEC region (India, Bangladesh, Bhutan, Maldives, Nepal, Sri Lanka, Thailand).

Your role is to provide:
1. **Emergency Response**: Instantly detect emergencies and provide life-saving guidance
2. **Road Safety Insights**: Real-time traffic hazards, accident-prone zones, weather impacts
3. **Safe Routing**: Suggest safest routes based on conditions and history
4. **Safety Tips**: Proactive driving and accident prevention advice
5. **Emotional Support**: Be empathetic during emergencies

**Response Style:**
- Warm, professional, and instantly actionable
- Direct emergency guidance when needed
- Conversational and helpful for regular queries
- Always provide location-aware advice when coordinates available
- Use emojis sparingly but effectively
- Keep responses concise (100-150 words)

**Emergency Keywords Detection**: accident, crash, SOS, help, emergency, injured, unconscious, bleeding, pain, collision, fire, flood, stuck, trapped

When emergency detected: Provide immediate action steps, nearest services, first aid basics, and reassurance.`,

  law: `You are RoadSoS DriveLegal AI, specialized in traffic laws and vehicle compliance for BIMSTEC countries.

Your expertise includes:
1. **Traffic Laws**: Speed limits, traffic signals, lane rules by country/state
2. **Vehicle Compliance**: License, insurance, pollution, safety requirements
3. **Traffic Fines**: Calculate penalties based on violations and local regulations
4. **Vehicle Documentation**: Requirements for registration, permits, insurance
5. **Driving Rules**: State-specific or country-specific regulations
6. **Legal Guidance**: Traffic dispute procedures, appeal processes

**Key Features:**
- State/country-specific answers for each BIMSTEC nation
- Current fine amounts (updated annually)
- Compliance deadlines and requirements
- Document checklist and renewal reminders
- Simple explanation of complex legal terms

**Response Style:**
- Authoritative and accurate
- Clear explanation of laws
- Practical compliance steps
- Warnings about penalties
- Keep under 200 words with structured format`,

  report: `You are RoadSoS RoadWatch AI, facilitating citizen reporting and road condition monitoring.

Your responsibilities:
1. **Issue Reporting**: Accept reports of potholes, flooding, accidents, unsafe infrastructure
2. **Report Validation**: Verify issue severity and location accuracy
3. **Status Tracking**: Follow up on citizen-reported issues
4. **Image Analysis**: Interpret uploaded road condition photos
5. **Community Engagement**: Thank citizens, show impact of reports

**Supported Issue Types:**
- Potholes and road damage
- Flooding and waterlogging
- Accidents and near-misses
- Traffic signal failures
- Dangerous road conditions
- Missing or damaged signage
- Construction hazards

**Response Style:**
- Encouraging and appreciative
- Action-oriented (what to do next)
- Clear issue categorization
- Location verification
- Thank you for community service
- Provide tracking reference number`,
};

async function callOpenAI(
  message: string,
  mode: string,
  userId: string,
  locationInfo: string
): Promise<{ reply: string; isEmergency: boolean }> {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured');
  }

  // Get or initialize conversation history
  const key = `${userId}-${mode}`;
  if (!conversationMemory.has(key)) {
    conversationMemory.set(key, []);
  }
  const history = conversationMemory.get(key)!;

  // Build messages with history (keep last 10 messages for context)
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    {
      role: 'system',
      content: SYSTEM_PROMPTS[mode],
    },
    ...history.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: locationInfo ? `${message}\n${locationInfo}` : message,
    },
  ];

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const reply = response.choices[0]?.message?.content || 'Unable to generate response';

  // Check for emergency in response
  const isEmergency = /\b(emergency|sos|ambulance|hospital|immediate|urgent|critical|life-threatening)\b/i.test(
    reply
  );

  // Store conversation for memory
  history.push(
    { role: 'user', content: message },
    { role: 'assistant', content: reply }
  );

  // Keep memory bounded (max 50 messages per mode per user)
  if (history.length > 50) {
    history.splice(0, history.length - 50);
  }

  return { reply, isEmergency };
}

function getFallbackResponse(
  message: string,
  mode: string,
  isEmergency: boolean,
  locationHint: string
): { reply: string; isEmergency: boolean } {
  const responses: Record<string, () => string> = {
    companion: () => {
      if (isEmergency) {
        return `🚨 EMERGENCY DETECTED${locationHint}

IMMEDIATE ACTIONS:
1. **Call 112 (Ambulance)** or 100 (Police)
2. Move to a safe location if possible
3. Provide your exact location to dispatcher
4. I'm routing nearby hospitals and emergency services

Your concern: "${message}"

RoadSoS emergency protocols activated. Stay calm and focus on safety.`;
      }
      return `Welcome to RoadSoS AI. I'm here to help with:
• Emergency routing and first aid
• Road safety and route optimization
• Traffic updates and hazard warnings
• Safe driving tips and accident prevention

Your question: "${message}"

For better assistance, please share your location or be specific about your concern. How can I help ensure your safety today?`;
    },

    law: () => {
      return `RoadSoS DriveLegal Assistant here.

Your question: "${message}"

To provide accurate traffic law information, I need:
• Your country/state in BIMSTEC region
• Specific traffic or vehicle concern
• Whether it's about fines, compliance, or regulations

I can help with:
✓ Traffic law violations and penalties
✓ Vehicle compliance requirements
✓ License and insurance information
✓ Fine calculations for your region
✓ Traffic dispute procedures

What traffic law information do you need?`;
    },

    report: () => {
      return `RoadSoS RoadWatch - Community Safety Program

Your report: "${message}"

To process your road condition report:
1. **Issue Type**: Specify the problem (pothole, flooding, accident, etc.)
2. **Location**: Provide address, road name, or GPS coordinates
3. **Severity**: Is this urgent or routine?
4. **Evidence**: Photo or video helps (if applicable)

Your report helps improve road safety for everyone! 

Report Reference: RW-${Date.now()}

Thank you for contributing to safer roads in our region.`;
    },
  };

  return {
    reply: (responses[mode] || responses.companion)(),
    isEmergency,
  };
}

function isEmergencyMessage(message: string): boolean {
  return /\b(accident|sos|emergency|help|hurt|injur|crash|collision|fire|flood|stuck|bleed|unconscious|pain|trapped|dying|critical|urgent)\b/i.test(
    message
  );
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

  const { message, mode, lat, lng, language, userId = 'anonymous' } = parsed.data;

  const locationHint =
    typeof lat === 'number' && typeof lng === 'number'
      ? `\n[Location Context: Latitude ${lat.toFixed(4)}, Longitude ${lng.toFixed(4)}]`
      : '';

  const isEmergency = isEmergencyMessage(message);

  let response: { reply: string; isEmergency: boolean };

  try {
    // Try to use OpenAI if available
    if (openaiClient) {
      response = await callOpenAI(message, mode, userId, locationHint);
    } else {
      // Fallback to deterministic responses
      response = getFallbackResponse(message, mode, isEmergency, locationHint);
    }
  } catch (error) {
    // Graceful fallback if API fails
    console.error('OpenAI API error:', error);
    response = getFallbackResponse(message, mode, isEmergency, locationHint);
  }

  return res.json({
    reply: response.reply,
    meta: {
      language,
      isEmergency: response.isEmergency || isEmergency,
      mode,
      locationProvided: !!(lat && lng),
      timestamp: new Date().toISOString(),
    },
  });
});
