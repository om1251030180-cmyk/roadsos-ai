# 🚀 Quick Deployment Guide - TL;DR

## 3-Step Deployment (30 minutes total)

### Step 1: Backend Deployment (Render)

```bash
1. Go to render.com → Create Web Service
2. Connect: om1251030180-cmyk/roadsos-ai
3. Root: server/
4. Env vars:
   - OPENAI_API_KEY=sk-...
   - ELEVENLABS_API_KEY=...
5. Deploy & Copy URL
```

### Step 2: Frontend Deployment (Vercel)

```bash
1. Go to vercel.com → Add Project
2. Import: om1251030180-cmyk/roadsos-ai
3. Root: roadsos-ai/client
4. Env vars:
   - NEXT_PUBLIC_API_URL=https://[your-render-url]
5. Deploy!
```

### Step 3: Test

```bash
1. Open your Vercel URL
2. Click AI companion → Test chat
3. Test voice, SOS, map
4. ✅ Done!
```

---

## 📋 One-Minute Checklist

- [ ] Have OpenAI API key ready
- [ ] Have ElevenLabs API key (optional)
- [ ] Go to Render.com
- [ ] Deploy backend (10 min)
- [ ] Copy backend URL
- [ ] Go to Vercel.com
- [ ] Deploy frontend with backend URL (10 min)
- [ ] Wait for build (2-3 min)
- [ ] Test on live URL
- [ ] Share with judges! 🎉

---

## 🔗 Links

- GitHub: https://github.com/om1251030180-cmyk/roadsos-ai
- Vercel: https://vercel.com
- Render: https://render.com
- Full Guide: See DEPLOYMENT.md

---

## 💡 Key Points

- Root dir for frontend: `roadsos-ai/client`
- Root dir for backend: `server/`
- Frontend needs env var: `NEXT_PUBLIC_API_URL`
- Backend needs: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
- Everything is Git ready to push!

---

## 🆘 Common Issues

| Issue               | Solution                                              |
| ------------------- | ----------------------------------------------------- |
| "API unreachable"   | Set `NEXT_PUBLIC_API_URL` in Vercel                   |
| "Build failed"      | Check root directory is `roadsos-ai/client`           |
| "No chat response"  | Verify `OPENAI_API_KEY` is correct                    |
| "Voice not working" | Check `ELEVENLABS_API_KEY` (or falls back to browser) |

---

**Need detailed help? See DEPLOYMENT.md**
