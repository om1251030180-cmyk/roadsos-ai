# ElevenLabs Voice Synthesis Setup Guide

## Overview

RoadSoS AI now features premium voice synthesis powered by ElevenLabs. This gives the AI voice companion a natural, expressive voice with emotional variation based on emergency context.

## Prerequisites

- Node.js 18+ installed
- ElevenLabs account with API key
- OpenAI API key (for chat responses)

## Step 1: Get Your ElevenLabs API Key

1. Visit [ElevenLabs.io](https://elevenlabs.io)
2. Sign up or log in
3. Go to **Profile Settings** → **API Keys**
4. Copy your API key (starts with similar format to OpenAI)
5. **Important:** Keep this secure and never commit to version control

## Step 2: Configure Environment Variables

1. Open `server/.env` in your editor
2. Find the ElevenLabs section and uncomment/add:
   ```bash
   ELEVENLABS_API_KEY=your-api-key-here
   ```
3. Save the file

## Step 3: Available Voice Styles

The system supports 5 premium voices optimized for different contexts:

### Emergency Voice

- **Use**: Critical alerts, emergency responses
- **Characteristics**: Professional, urgent, authoritative
- **Best for**: SOS messages, accident alerts, emergency protocols

### Professional Voice (Default)

- **Use**: Standard chat and information delivery
- **Characteristics**: Friendly, professional, clear
- **Best for**: Regular road safety queries

### Friendly Voice

- **Use**: Casual conversation, encouragement
- **Characteristics**: Warm, conversational, approachable
- **Best for**: Tips, citizen encouragement, general advice

### Calm Voice

- **Use**: De-escalation, first aid guidance
- **Characteristics**: Soothing, measured, reassuring
- **Best for**: Emergency first aid instructions, calming responses

### Authoritative Voice

- **Use**: Instructions, legal information, governance
- **Characteristics**: Strong, commanding, clear
- **Best for**: Traffic law (DriveLegal), compliance info, authority broadcasts

## Step 4: Start the Backend

```bash
cd server
npm run dev
```

You should see:

```
[server] listening on http://localhost:4000
```

## Features Enabled

✅ **Premium Voice Quality**: Natural-sounding synthesis
✅ **Emotional Context**: Voice style changes based on emergency status
✅ **Multi-language Ready**: ElevenLabs supports 30+ languages
✅ **Fast Response**: ~500ms-1s for voice generation
✅ **Graceful Fallback**: Falls back to browser TTS if API unavailable
✅ **Streaming Ready**: Audio delivered as base64 data URLs

## Voice Synthesis Workflow

1. **User speaks to Voice Companion Orb**
   - Web Speech API captures voice
   - Recognized text sent to `/api/chat`

2. **Backend processes with OpenAI**
   - GPT generates intelligent response
   - Returns with emergency flag

3. **Frontend requests voice synthesis**
   - Calls `/api/voice` with response text
   - Selects appropriate voice style (emergency vs. professional)

4. **ElevenLabs generates audio**
   - Backend synthesizes speech
   - Returns as base64 data URL

5. **Audio plays in browser**
   - Voice Companion Orb emotional state updates
   - Audio plays through HTML5 Audio element

## API Endpoints

### POST /api/voice

Generate speech from text

**Request:**

```json
{
  "text": "Your message here",
  "voiceId": "professional",
  "language": "en"
}
```

**Voice IDs:** `professional`, `emergency`, `friendly`, `calm`, `authoritative`

**Response:**

```json
{
  "ok": true,
  "audio": "data:audio/mpeg;base64,...",
  "meta": {
    "voiceId": "professional",
    "language": "en",
    "textLength": 25,
    "duration": 2500
  }
}
```

### GET /api/voice/health

Check voice synthesis service status

**Response:**

```json
{
  "ok": true,
  "voiceSynthesis": {
    "available": true,
    "apiKeyConfigured": true,
    "availableVoices": [
      "emergency",
      "professional",
      "friendly",
      "calm",
      "authoritative"
    ]
  }
}
```

### GET /api/voice/voices

List available voice configurations

## Costs & Usage

- **Cost**: ~$0.03 per 1,000 characters
- **Quality**: Premium neural voices
- **Latency**: 500ms-1s per request
- **Limit**: Depends on ElevenLabs plan tier

### Cost Examples:

- Short response (100 chars): $0.003
- Medium response (500 chars): $0.015
- Long response (1000 chars): $0.030

### Monthly Estimate (1000 chats/day):

- Average response: 300 chars
- Daily: ~$90
- Monthly: ~$2,700

_Note: This is for premium voices. Standard voices are cheaper (~$0.01 per 1K chars)_

## Fallback Behavior

If ElevenLabs API is unavailable:

1. **Graceful degradation**: Falls back to browser Web Speech API
2. **No broken experience**: User still hears response
3. **Console warning**: "ElevenLabs unavailable, falling back to browser TTS"
4. **Quality trade-off**: Browser TTS less natural but functional

## Troubleshooting

### "Voice synthesis service unavailable"

- Check `ELEVENLABS_API_KEY` is set in `.env`
- Verify API key is correct
- Check ElevenLabs account has credits

### Audio doesn't play

- Check browser Audio API support
- Verify network request succeeded (check Network tab)
- Try refreshing the page

### "Rate limit exceeded"

- You've hit ElevenLabs rate limits
- Wait a minute and retry
- Upgrade ElevenLabs plan for higher limits

### Slow voice responses

- Normal latency: 500ms-1s
- Network + processing time
- Consider pre-generating common responses

## Advanced Configuration

### Custom Voice Selection

Edit `server/src/routes/voice.ts` to add custom voices:

```typescript
const VOICE_IDS = {
  custom: "YOUR_VOICE_ID",
  // ... other voices
};
```

### Voice Personalization

Edit `server/src/routes/voice.ts` model settings:

```typescript
await elevenLabsClient.generate({
  voice: voiceId,
  text,
  model_id: "eleven_monolingual_v1", // Can change model here
  stability: 0.5, // 0-1: Lower = more variation
  similarity_boost: 0.75, // 0-1: Higher = more similar to original
});
```

## Production Deployment

For production use:

1. Use environment secrets manager
2. Set `ELEVENLABS_API_KEY` in deployment platform
3. Monitor API usage and costs
4. Consider caching common phrases
5. Implement request throttling to prevent rate limits
6. Add monitoring/alerting for API failures

## Testing Voice Features

1. Start the backend: `npm run dev` in `server/`
2. Start the frontend: `npm run dev` in `roadsos-ai/client/`
3. Say "Hey RoadSoS" or "Emergency Help"
4. Voice companion should respond with premium voice

## Next Steps

- **Multi-language**: Add support for Hindi, Tamil, Bengali, etc.
- **Voice Cloning**: Create custom branded voice
- **Streaming**: Implement real-time voice streaming
- **Caching**: Pre-generate common safety phrases

---

For questions, see [OpenAI setup](./OPENAI_SETUP.md) for AI chat configuration.
