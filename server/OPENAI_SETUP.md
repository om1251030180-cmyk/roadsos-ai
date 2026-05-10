# RoadSoS AI - Backend Setup Guide

## OpenAI Integration Setup

The RoadSoS AI chat backend now supports intelligent responses powered by OpenAI's GPT models. This guide walks you through enabling this feature.

### Prerequisites

- Node.js 18+ installed
- OpenAI API account with credits
- API key from OpenAI platform

### Step 1: Get Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Go to **API keys** → **Create new secret key**
4. Copy the key (it starts with `sk-`)
5. **Important:** Save it securely - you won't be able to see it again

### Step 2: Configure Environment Variables

1. Open `server/.env` in your editor
2. Uncomment and set your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file
4. **Important:** Never commit `.env` to version control (it's in `.gitignore`)

### Step 3: Start the Backend Server

```bash
cd server
npm run dev
```

You should see:

```
[server] listening on http://localhost:4000
```

### Step 4: Test the Integration

Use the RoadSoS AI client to send a message. The chat interface will now use OpenAI for intelligent responses.

**Test queries:**

- "What's the nearest hospital to my location?"
- "What's the helmet fine in India?"
- "Report a pothole on Main Street"
- "Emergency! I had an accident"

## Features Enabled

✅ **Emergency Detection** - Instantly identifies emergency keywords and escalates responses
✅ **Context Awareness** - Understands location coordinates for localized advice
✅ **Traffic Law Guidance** - DriveLegal - provides BIMSTEC country-specific traffic laws
✅ **Road Safety Intelligence** - RoadWatch integration for citizen reporting
✅ **Multi-language Support** - Ready for Hindi, Tamil, Bengali, Nepali, Sinhala, Thai, Burmese

## Cost Information

OpenAI API usage is metered:

- **gpt-3.5-turbo**: ~$0.0015 per 1K tokens (very affordable)
- **gpt-4-turbo**: ~$0.01 per 1K tokens (higher quality, more expensive)

For demo/testing, gpt-3.5-turbo is recommended. You get $5 free credits on signup.

## Fallback Behavior

If the OpenAI API key is not configured or the API is unavailable:

- The system automatically falls back to deterministic responses
- Emergency detection still works normally
- Users won't experience broken chat - they'll get helpful default responses

## Troubleshooting

### "OpenAI API key not configured" Error

- Check that `.env` file exists in the `server/` directory
- Verify the `OPENAI_API_KEY` line is uncommented
- Ensure you're using a valid key (starts with `sk-`)

### Slow Responses

- OpenAI API calls typically take 1-3 seconds
- This is normal - network latency adds ~500ms-1000ms
- Consider adding a loading indicator (already implemented in chat UI)

### "Rate limit exceeded" Error

- You've hit OpenAI's rate limit for your plan
- Wait a minute and try again
- Upgrade your OpenAI plan for higher limits

### Empty Responses

- The API might be returning null
- Check your account has credits remaining
- Verify the API key is correct

## Production Deployment

For production environments:

1. Use environment variables, not `.env` files
2. Set `OPENAI_API_KEY` in your platform's secrets manager
3. Consider using OpenAI's batch API for non-urgent queries
4. Implement request caching for common queries
5. Monitor API usage and costs

## Advanced Configuration

You can customize the AI behavior by editing the `SYSTEM_PROMPT` in `server/src/routes/chat.ts`:

```typescript
const SYSTEM_PROMPT = `You are RoadSoS AI, an intelligent emergency and road safety assistant...`;
```

This system prompt defines the AI's personality, expertise, and response style. Modify it to:

- Change the tone (more formal, more casual)
- Add regional expertise
- Customize emergency protocols
- Adjust response length

## API Response Structure

```json
{
  "reply": "Your intelligent response from OpenAI",
  "meta": {
    "language": "en",
    "isEmergency": false,
    "locationProvided": true
  }
}
```

- `reply`: The AI-generated response text
- `language`: Detected or specified language
- `isEmergency`: Whether emergency keywords were detected
- `locationProvided`: Whether GPS coordinates were sent

## Next Steps

After enabling OpenAI integration:

1. **Voice Synthesis** - Integrate ElevenLabs for premium voice responses
2. **Vision Detection** - Add YOLOv8 for RoadWatch image analysis
3. **Chat History** - Implement persistent memory across sessions
4. **Multi-modal** - Support voice input + text output

---

For more information, see the main [README.md](../README.md)
