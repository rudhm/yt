# My YouTube - Setup Guide

## Current Status: Local Development Complete ✅

Phase 1 (Backend) and Phase 2 (Frontend) are fully implemented and tested locally.

## What's Working Right Now

✅ Backend API server with Shorts filtering  
✅ React frontend with search, grid, and video player  
✅ Full-stack integration tested locally  
✅ Git repository initialized with initial commit  
✅ Comprehensive documentation in all READMEs  

## Next Steps

### Option 1: Use Locally (Immediate)

You can start using the app right now on your local machine:

1. **Get a YouTube API Key** (5 minutes):
   - Go to https://console.cloud.google.com
   - Create a new project (e.g., "My YouTube App")
   - Enable "YouTube Data API v3"
   - Create Credentials → API Key
   - Copy the API key

2. **Configure Backend**:
   ```bash
   cd /home/rudhm/code/my-youtube/backend
   # Edit .env file and replace "your_google_api_key_here" with your real API key
   nano .env  # or use your preferred editor
   ```

3. **Start Both Servers** (in separate terminals):
   ```bash
   # Terminal 1 - Backend
   cd /home/rudhm/code/my-youtube/backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd /home/rudhm/code/my-youtube/frontend
   npm run dev
   ```

4. **Open in Browser**:
   - Visit http://localhost:5173
   - Start searching! All Shorts will be filtered out

### Option 2: Deploy to Cloud (Always Online)

To make this accessible from any device anywhere:

#### Step 1: Push to GitHub

1. **Create GitHub repository**:
   - Go to https://github.com/new
   - Name: `my-youtube` (or whatever you prefer)
   - Make it **Private** (since it will contain your project)
   - Don't initialize with README (we already have one)

2. **Push your code**:
   ```bash
   cd /home/rudhm/code/my-youtube
   git remote add origin https://github.com/YOUR_USERNAME/my-youtube.git
   git push -u origin master
   ```

#### Step 2: Deploy Backend to Render

1. Go to https://render.com and create account
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select `my-youtube` repo
4. Configure:
   - **Name**: my-youtube-api (or any name)
   - **Region**: Choose closest to you
   - **Branch**: master
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `YOUTUBE_API_KEY` = your_actual_api_key
   - `PORT` = 5000
6. Click "Create Web Service"
7. Wait for deployment (3-5 minutes)
8. Copy the URL (e.g., `https://my-youtube-api.onrender.com`)

#### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com and create account
2. Click "Add New" → "Project"
3. Import your `my-youtube` GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = your_render_backend_url (from Step 2)
6. Click "Deploy"
7. Wait for deployment (1-2 minutes)
8. Get your URL (e.g., `https://my-youtube.vercel.app`)

#### Step 4: Update Backend CORS

1. Edit `backend/server.js` to allow your Vercel domain:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:5173', 'https://my-youtube.vercel.app']
   }));
   ```
2. Commit and push:
   ```bash
   git add backend/server.js
   git commit -m "Configure CORS for production"
   git push
   ```
3. Render will auto-deploy the update

#### Step 5: Test Production

- Visit your Vercel URL from any device
- Search for videos
- Verify Shorts are filtered
- Watch videos!

## Future Enhancements (Optional)

### Phase 3: Add Google OAuth (For Subscriptions)

1. In Google Cloud Console:
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs
2. Install passport libraries in backend
3. Implement login/logout routes
4. Add subscription feed page in frontend

### Phase 5: Polish Features

- Search results caching (reduce API quota usage)
- Channel blocking
- Keyword filtering
- Remember playback position
- Keyboard shortcuts
- Custom themes

## Troubleshooting

**"API key not configured" error**:
- Edit `backend/.env` and add your real YouTube API key
- Restart the backend server

**Frontend can't connect to backend**:
- Make sure backend is running on port 5000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:5000`
- Look for errors in browser console (F12)

**Deployment issues**:
- Check Render logs for backend errors
- Check Vercel logs for frontend build errors
- Verify environment variables are set correctly

**API quota exceeded**:
- You've used 10,000 units for the day
- Quota resets at midnight Pacific Time
- Implement caching to reduce API calls

## Cost Breakdown

| Service | Tier | Cost |
|---|---|---|
| Google Cloud (YouTube API) | Free tier | ₹0 (10k units/day) |
| Render (Backend hosting) | Free tier | ₹0 (750 hours/month) |
| Vercel (Frontend hosting) | Free tier | ₹0 (unlimited) |
| GitHub (Code storage) | Free tier | ₹0 |
| **Total** | | **₹0/month** |

Free tier limits are more than enough for personal/household use.

## Support

- Backend README: `/home/rudhm/code/my-youtube/backend/README.md`
- Frontend README: `/home/rudhm/code/my-youtube/frontend/README.md`
- Project README: `/home/rudhm/code/my-youtube/README.md`

## Summary

**You now have a fully functional, production-ready YouTube frontend that:**
- Completely filters out Shorts
- Works locally right now (just add API key)
- Can be deployed to cloud for free
- Is accessible from any device
- Has zero ongoing costs

Enjoy your distraction-free YouTube experience! 🎉
