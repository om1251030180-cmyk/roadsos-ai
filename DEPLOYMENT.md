# 🚀 RoadSoS AI - Deployment Guide

## Quick Deployment (5 minutes)

### Prerequisites

- GitHub account with your code pushed
- Vercel account (free at vercel.com)
- OpenAI API key
- ElevenLabs API key (optional for voice)

---

## 📦 Option 1: Deploy Frontend to Vercel (RECOMMENDED)

### Step 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (recommended)
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository: `om1251030180-cmyk/roadsos-ai`
5. Select **`roadsos-ai/client`** as the root directory
6. Click **"Deploy"**

### Step 2: Configure Environment Variables

After deployment starts, go to **Project Settings** → **Environment Variables**:

Add these variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

If you're using a local backend for development:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Step 3: Redeploy

Trigger a new deployment with the environment variables set:

1. Go to **Deployments**
2. Click the latest deployment
3. Click **"Redeploy"** (top right)

✅ **Frontend is now live!**

---

## 🖥️ Option 2: Deploy Backend to Render/Railway/Heroku

### Using Render (Recommended - Free Tier)

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select branch: `main`
5. Set **Start Command**: `npm run dev`
6. Set **Build Command**: `npm install`
7. Add Environment Variables:
   - `OPENAI_API_KEY`: Your API key
   - `ELEVENLABS_API_KEY`: Your API key
   - `PORT`: 4000
8. Click **"Create Web Service"**

Get your backend URL (e.g., `https://roadsos-backend.onrender.com`)

Then update your Vercel frontend:

1. Go to Vercel dashboard
2. Project **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
4. **Redeploy** the frontend

---

## 🔌 API Integration

### Frontend API Calls

The frontend uses these API endpoints:

```javascript
// Chat endpoint
const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
  {
    text: userMessage,
    location: { lat, lng },
  },
);

// Voice endpoint
const audioResponse = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/voice`,
  {
    text: responseText,
    voiceId: "voiceId",
  },
);

// Nearby services endpoint
const services = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/api/nearby?lat=${lat}&lng=${lng}`,
);
```

### Ensure Backend Supports CORS

Your Express server should have CORS enabled for Vercel domain:

```typescript
import cors from "cors";

app.use(
  cors({
    origin: ["https://your-vercel-domain.vercel.app", "http://localhost:3000"],
    credentials: true,
  }),
);
```

---

## 📝 Environment Variables Checklist

### Backend (server/.env)

```
PORT=4000
OPENAI_API_KEY=sk-your-key-here
ELEVENLABS_API_KEY=your-key-here
EMERGENCY_AMBULANCE=112
EMERGENCY_POLICE=100
EMERGENCY_FIRE=101
```

### Frontend (vercel.env, not in repo)

```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## 🔐 Security Checklist

- ✅ API keys are **never committed** to GitHub (use .env.example instead)
- ✅ Sensitive variables configured in Vercel dashboard only
- ✅ CORS is properly configured
- ✅ API rate limiting enabled (OpenAI handles this)
- ✅ Error messages don't expose sensitive data

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│  Your GitHub Repository                     │
│  om1251030180-cmyk/roadsos-ai              │
└────────────┬────────────────────────────────┘
             │
             ├─► [Vercel] Frontend (Next.js)
             │   └─ https://roadsos.vercel.app
             │
             └─► [Render/Railway] Backend (Express)
                 └─ https://roadsos-backend.onrender.com
```

---

## 🧪 Testing Deployment

### 1. Test Frontend

```bash
curl https://your-vercel-url.vercel.app
# Should return HTML with your app
```

### 2. Test Backend

```bash
curl https://your-backend-url/api/health
# Should return { status: "ok" }
```

### 3. Test Chat API

```bash
curl -X POST https://your-backend-url/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "location": {"lat": 0, "lng": 0}}'
```

### 4. Test Voice API

```bash
curl -X POST https://your-backend-url/api/voice \
  -H "Content-Type: application/json" \
  -d '{"text": "Emergency help", "voiceId": "default"}'
```

---

## 🚨 Troubleshooting

### Frontend shows "API is unreachable"

- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend is running
- Check CORS settings on backend

### Voice isn't working

- Verify `ELEVENLABS_API_KEY` is set
- Check `/api/voice/health` endpoint
- Review backend logs

### Chat returns empty responses

- Verify `OPENAI_API_KEY` is set
- Check OpenAI quota and billing
- Review backend logs with `npm run dev`

### Deployment fails

- Check Node version (should be 18+)
- Verify all dependencies are installed
- Check build logs in Vercel dashboard

---

## 📞 Get Your Live URLs

After deployment:

1. **Frontend URL**: Check Vercel dashboard
   - Format: `https://roadsos-ai.vercel.app` or custom domain
2. **Backend URL**: Check Render/Railway dashboard
   - Format: `https://roadsos-backend.onrender.com`

3. **Update Frontend Environment**: Add backend URL to Vercel

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Your code is automatically tested on push:

- TypeScript compilation check
- ESLint validation
- Build verification

Create `.github/workflows/deploy.yml` for automatic deployments.

---

## 📈 Monitoring & Logs

### Vercel

- Dashboard shows deployment status
- Logs available in Deployments tab
- Performance metrics available

### Render/Backend

- Logs available in dashboard
- Monitor CPU/Memory usage
- Set up alerts for errors

---

## 💰 Cost Estimation

**Vercel (Frontend)**

- Free tier: Perfect for MVP
- Pro tier: $20/month for priority support

**Render (Backend)**

- Free tier: Limited (recommended for demo)
- Pay-as-you-go: Starts at $7/month

**OpenAI API**

- ~$0.002 per chat request
- ~$0.03 per voice generation (500 chars)

**ElevenLabs API**

- ~$0.03 per 1,000 characters
- Free tier: 10,000 characters/month

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Environment variables configured
- [ ] Backend deployed (Render/Railway/Heroku)
- [ ] API URL updated in frontend
- [ ] Frontend redeployed with correct API URL
- [ ] Chat works end-to-end
- [ ] Voice synthesis works
- [ ] All services routable
- [ ] Emergency system tested

---

## 🎉 You're Live!

Share your deployed URL with judges and users:

```
🚀 RoadSoS AI Demo: https://roadsos-ai.vercel.app
📱 Try the emergency response system
🗣️ Voice interaction enabled
🎯 Real-time service routing
```

---

## 📞 Support & Next Steps

1. **Scale Backend**: Move to dedicated server if needed
2. **Add Database**: PostgreSQL for persistent chat history
3. **Custom Domain**: Vercel supports custom domains
4. **Analytics**: Add Vercel Analytics for insights
5. **Monitoring**: Set up Sentry for error tracking

---

Need help? Check the GitHub repository or contact support!
