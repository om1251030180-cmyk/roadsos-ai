# RoadSoS AI - Environment Variables Configuration

## 📋 Overview

This document explains all environment variables used in RoadSoS AI and how to configure them for different environments.

---

## 🖥️ Backend Environment Variables (`server/.env`)

### Required Variables

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-api-key-here
# Optional: Use alternative API endpoint
# OPENAI_BASE_URL=https://api.openai.com/v1
# Optional: Specify model (default: gpt-3.5-turbo)
# OPENAI_MODEL=gpt-3.5-turbo

# ElevenLabs Voice Synthesis (Optional but recommended)
ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Emergency Contact Numbers (Used in fallback responses)
EMERGENCY_AMBULANCE=112
EMERGENCY_POLICE=100
EMERGENCY_FIRE=101
```

### How to Get API Keys

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Click your profile → **"API keys"**
4. Click **"Create new secret key"**
5. Copy the key and paste into `.env`

**Cost**: ~$0.0015 per 1K tokens (~500 words)

#### ElevenLabs API Key (Optional)
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up or log in
3. Click your profile → **"API Keys"**
4. Copy the key and paste into `.env`

**Cost**: ~$0.03 per 1,000 characters (but offers free 10K chars/month)

---

## 💻 Frontend Environment Variables

### Development (`roadsos-ai/client/.env.local`)

```env
# Not needed for local development (defaults to localhost:4000)
# NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Production (Vercel Environment Variables)

In your Vercel project dashboard:

**Settings** → **Environment Variables**

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Replace `your-backend-domain.com` with:
- Render: `https://your-app.onrender.com`
- Railway: `https://your-app-prod.up.railway.app`
- Heroku: `https://your-app.herokuapp.com`

---

## 🚀 Production Deployment Checklist

### 1. Backend Deployment (Render Example)

**Environment Variables to Set:**
- `OPENAI_API_KEY` = Your OpenAI key
- `ELEVENLABS_API_KEY` = Your ElevenLabs key
- `PORT` = 4000
- `NODE_ENV` = production

**Render Configuration:**
- Start Command: `npm run dev` (or `npm start` if applicable)
- Build Command: `npm install && npm run build`
- Root Directory: `server/`

**Result**: Your backend URL (e.g., `https://roadsos-backend.onrender.com`)

### 2. Frontend Deployment (Vercel Example)

**Vercel Configuration:**
- Root Directory: `roadsos-ai/client`
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Framework: Next.js (auto-detected)

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` = Your backend URL from step 1

**Result**: Your frontend URL (e.g., `https://roadsos.vercel.app`)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to GitHub
   - `.env` is in `.gitignore` by default
   - Use `.env.example` for documentation only

2. **API Key Rotation**
   - Rotate keys quarterly
   - Remove old keys immediately
   - Monitor usage for suspicious activity

3. **Rate Limiting**
   - OpenAI handles rate limiting automatically
   - Monitor API usage in dashboard
   - Set spending limits in OpenAI settings

4. **CORS Configuration**
   - Backend CORS is configured for:
     - `http://localhost:3000` (development)
     - `https://your-vercel-domain.vercel.app` (production)

---

## 🧪 Testing Environment Variables

### Verify Backend Variables
```bash
cd server
npm run dev

# Should see:
# ✅ Server listening on http://localhost:4000
# ✅ OpenAI configured
# ✅ ElevenLabs configured (if key provided)
```

### Verify Frontend Configuration
```bash
cd roadsos-ai/client
NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev

# Open http://localhost:3000
# Try the chat - should connect to backend
```

---

## 📝 Environment Variable Reference

| Variable | Backend | Frontend | Required | Example |
|----------|---------|----------|----------|---------|
| OPENAI_API_KEY | ✅ | ❌ | Yes | sk-abc123... |
| ELEVENLABS_API_KEY | ✅ | ❌ | No | abc123def... |
| NEXT_PUBLIC_API_URL | ❌ | ✅ | No* | https://api.example.com |
| PORT | ✅ | ❌ | No | 4000 |
| NODE_ENV | ✅ | ❌ | No | production |
| EMERGENCY_AMBULANCE | ✅ | ❌ | No | 112 |
| EMERGENCY_POLICE | ✅ | ❌ | No | 100 |
| EMERGENCY_FIRE | ✅ | ❌ | No | 101 |

*Defaults to `http://localhost:4000` in development

---

## 🐛 Troubleshooting

### "Chat returns generic responses"
- Check `OPENAI_API_KEY` is set correctly
- Verify API key is active (not revoked)
- Check OpenAI billing/quota settings
- Look for errors in backend logs: `npm run dev`

### "Voice isn't working"
- Check `ELEVENLABS_API_KEY` is set
- Verify API key is active
- Check ElevenLabs dashboard for usage
- Test `/api/voice/health` endpoint

### "Build fails in Vercel"
- Ensure all required environment variables are set
- Check Node.js version compatibility
- Review build logs in Vercel dashboard
- Verify dependencies are installed

### "Backend URL not accessible from frontend"
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS is enabled on backend
- Verify backend is running and accessible
- Test with: `curl https://backend-url/api/health`

---

## 🔄 Environment Variables by Stage

### Development
- Backend: `.env` file locally
- Frontend: No `.env` needed (defaults to localhost:4000)
- API keys: Can use test keys

### Staging
- Backend: Deployed to test server with prod keys
- Frontend: Deployed to staging URL
- API keys: Use production keys (carefully monitor usage)

### Production
- Backend: Deployed to production server
- Frontend: Deployed to Vercel
- API keys: Production keys with spending limits set
- Monitoring: Enable alerts for unusual activity

---

## 📞 Support

Need help setting up environment variables?
1. Check the `.env.example` files
2. Review this document
3. Check individual setup guides:
   - `server/OPENAI_SETUP.md`
   - `server/ELEVENLABS_SETUP.md`
4. Contact support

---

## ✅ Setup Checklist

- [ ] Copy `.env.example` to `.env` in `server/` directory
- [ ] Add `OPENAI_API_KEY` from platform.openai.com
- [ ] Add `ELEVENLABS_API_KEY` (optional) from elevenlabs.io
- [ ] Test backend: `cd server && npm run dev`
- [ ] Test frontend: `cd roadsos-ai/client && npm run dev`
- [ ] For Vercel deployment: Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Verify chat works end-to-end
- [ ] Verify voice synthesis works (if using ElevenLabs)

You're all set! 🎉
