# My YouTube - Custom Frontend

> A distraction-free YouTube experience with complete Shorts filtering

[![Backend](https://img.shields.io/badge/Backend-Node.js-green)](./backend)
[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](./frontend)
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

## What is This?

A personal YouTube frontend that completely eliminates Shorts and provides a clean, ad-free viewing experience. Access from any browser, any device, anywhere.

### Key Features

✅ **Zero Shorts** - Automatic filtering via YouTube Data API v3  
✅ **Always Online** - Hosted on free tier (Vercel + Render)  
✅ **Clean UI** - No recommendations, no bloat, just search and watch  
✅ **Free Forever** - 100% open source, no costs  
✅ **Multi-Device** - Works on desktop, mobile, tablet  

## Quick Start

### Prerequisites

- Node.js 18+ installed
- YouTube Data API v3 key ([Get one here](https://console.cloud.google.com))

### Local Development

1. **Clone and setup:**
   ```bash
   cd my-youtube
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   # Add your YouTube API key to .env file
   echo "YOUTUBE_API_KEY=your_key_here" > .env
   npm run dev
   ```

3. **Frontend setup (in another terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
my-youtube/
├── backend/              # Node.js/Express API server
│   ├── routes/
│   │   └── search.js     # Shorts filtering logic
│   ├── server.js         # Main server
│   └── .env              # API keys (not committed)
│
├── frontend/             # React app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   └── utils/        # API client
│   └── .env              # Backend URL
│
└── README.md             # This file
```

## How It Works

```
┌─────────────┐
│   Browser   │ (Any device, anywhere)
└──────┬──────┘
       │
       ├─► Frontend (Vercel)
       │   └─► React UI, search interface
       │
       ├─► Backend (Render)
       │   └─► Filters Shorts, proxies API calls
       │
       └─► YouTube Data API v3 (Google)
           └─► Returns video data

Videos stream directly from YouTube CDN (not proxied)
```

### Shorts Filtering Strategy

The backend uses `videoDuration=medium` parameter in YouTube API search:
- **medium**: 4-20 minutes
- **long**: >20 minutes

Since Shorts are always <60 seconds, filtering for 4+ minutes eliminates all Shorts.

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create account on [render.com](https://render.com)
3. New Web Service → Connect GitHub repo
4. Select `backend` folder
5. Add environment variables:
   - `YOUTUBE_API_KEY`
   - `PORT=5000`
6. Deploy

### Frontend → Vercel

1. Create account on [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Select `frontend` folder
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

Both services auto-deploy on git push!

## API Quota

YouTube Data API v3 free tier: **10,000 units/day**

| Action | Cost | Daily Limit |
|---|---|---|
| Search | 100 units | ~100 searches |
| Video details | 1 unit | ~10,000 requests |

Perfect for personal/household use. Implement caching if needed.

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Fast, modern, component-based |
| Backend | Node.js + Express | Simple, async-friendly |
| API | YouTube Data API v3 | Official Google API |
| Hosting | Vercel + Render | Free tier, auto-deploy |
| Auth | OAuth 2.0 (future) | Secure Google sign-in |

## Roadmap

### Phase 1: MVP ✅
- [x] Backend with Shorts filtering
- [x] React frontend with search
- [x] Video playback
- [x] Responsive design

### Phase 2: Deployment (Pending)
- [ ] Deploy to Render (backend)
- [ ] Deploy to Vercel (frontend)
- [ ] Configure production environment
- [ ] Set up auto-deploy from GitHub

### Phase 3: Authentication (Future)
- [ ] Google OAuth 2.0 login
- [ ] Fetch user subscriptions
- [ ] Subscription feed page
- [ ] Watch history (filtered)

### Phase 4: Polish (Future)
- [ ] Search results caching
- [ ] Channel blocking feature
- [ ] Keyword filtering
- [ ] Remember playback position
- [ ] Keyboard shortcuts
- [ ] Custom dark themes

## Configuration

### Backend (.env)
```bash
PORT=5000
YOUTUBE_API_KEY=your_google_api_key
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000  # Local
# VITE_API_URL=https://your-api.onrender.com  # Production
```

## Getting YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Copy key to backend `.env` file

**Important:** Never commit API keys to git!

## Contributing

This is a personal project, but feel free to fork and customize for your own use.

## License

MIT - Use freely, no attribution required

## Troubleshooting

**Frontend can't connect to backend:**
- Check backend is running on port 5000
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

**"API key not configured" error:**
- Add real YouTube API key to backend `.env`
- Restart backend server after updating `.env`

**No search results:**
- Verify API key is valid
- Check API quota hasn't been exceeded
- Try broader search terms

## Support

For issues, check:
- Backend logs: `npm run dev` output in backend folder
- Frontend console: Browser DevTools → Console
- API quota: [Google Cloud Console](https://console.cloud.google.com)

---

Built to escape the Shorts rabbit hole. Enjoy distraction-free YouTube! 🎉
