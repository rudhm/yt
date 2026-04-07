# Custom YouTube Frontend — Project Note

## What I Want to Build

A personal YouTube frontend that I can open from any browser, on any device,
anywhere — home Wi-Fi, mobile data, doesn't matter. Works like a real website.
Shorts completely gone.

**Access:** Open browser on any device → visit my app URL → use it like YouTube  
**Who uses it:** Me and my household  
**Always on:** Yes — hosted online, doesn't need my PC to be running

---

## Why I'm Building This

- YouTube Shorts are addictive and I want them gone completely
- YouTube's main site is bloated — tracking scripts, ads, recommendation engine all running in background
- I want a cleaner, distraction-free experience with just videos
- My app will have zero Shorts, zero aggressive recommendations, less background CPU/RAM usage

---

## How It Will Work

```
My Browser / Phone
      ↓
My frontend (hosted on Vercel — always online)
      ↓
My backend (hosted on Render — always online)
      ↓
YouTube Data API v3 (Google's servers)
      ↓
Results come back → backend filters out Shorts → frontend shows clean results
```

Video streaming still happens from YouTube's servers directly.
My hosted backend only handles API calls and filtering — lightweight.

---

## Hosting Plan

| Part | Where | Cost |
|---|---|---|
| Frontend (React UI) | Vercel | Free |
| Backend (Node.js server) | Render | Free |
| Code storage | GitHub | Free |
| YouTube API | Google Cloud | Free (10k units/day) |

**Total cost: ₹0**

Vercel and Render both connect to your GitHub repo and auto-deploy whenever
you push updated code. Set it up once, forget about it.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Auth | Google OAuth 2.0 |
| API | YouTube Data API v3 |
| Video Player | YouTube iframe embed |

---

## Step-by-Step Build Plan

### Step 1 — Set Up Google API Access

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. "My YouTube App")
3. Enable **YouTube Data API v3**
4. Create credentials:
   - **API Key** — for search and video details
   - **OAuth 2.0 Client ID** — for login (subscriptions, history)
5. **API key goes in backend only — never in frontend code**

---

### Step 2 — Set Up Project Structure

```
my-youtube/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── search.js
│   │   ├── video.js
│   │   └── auth.js
│   └── .env             ← API key lives here, never commit this file
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── SearchBar.jsx
│           ├── VideoCard.jsx
│           └── VideoPlayer.jsx
└── package.json
```

---

### Step 3 — Backend (Node.js on Render)

Basic server:
```javascript
const express = require('express')
const app = express()

app.get('/api/search', async (req, res) => {
  // Call YouTube API
  // Filter out Shorts
  // Return clean results
})

app.listen(3000)
```

On Render, you set your API key as an **environment variable** in the dashboard —
so it's never visible in your code.

---

### Step 4 — Filter Out Shorts

YouTube API search supports a `videoDuration` parameter:

```
videoDuration=medium   → videos between 4–20 minutes
videoDuration=long     → videos over 20 minutes
```

Use both — this excludes anything under 4 minutes which covers essentially all Shorts.

For extra accuracy: after getting results, fetch each video's exact duration
and filter out anything under 60 seconds. Costs slightly more API quota but more reliable.

---

### Step 5 — Google OAuth Login

Lets you sign in with your Google account to see real subscriptions and history.

Flow:
1. Click "Sign In" → redirected to Google login
2. Google sends back an auth token
3. Backend uses that token to call YouTube API on your behalf

Library to use: `passport-google-oauth20`

---

### Step 6 — Frontend (React on Vercel)

Key components:

- **SearchBar** — sends query to your backend
- **VideoGrid** — displays results as cards
- **VideoCard** — thumbnail + title
- **VideoPlayer** — YouTube iframe, opens on click
- **Sidebar** — your subscriptions (requires login)

Video embed:
```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  allowfullscreen
/>
```

---

### Step 7 — Deploy

**Backend → Render:**
1. Push code to GitHub
2. Create account on render.com
3. New Web Service → connect GitHub repo → select backend folder
4. Add environment variables (API key, OAuth secrets)
5. Deploy — get a URL like `https://my-youtube-api.onrender.com`

**Frontend → Vercel:**
1. Create account on vercel.com
2. Import GitHub repo → select frontend folder
3. Set environment variable: your Render backend URL
4. Deploy — get a URL like `https://my-youtube.vercel.app`

Done. Open that URL on any device, anywhere.

---

## API Quota

Free tier: **10,000 units/day**

| Action | Units |
|---|---|
| Search | 100 units |
| Video details | 1 unit |
| Subscriptions list | 1 unit |

~100 searches/day for free. For personal + family use this is plenty.
If it runs out, results can be cached so repeated searches don't burn quota.

---

## What This App Will NOT Have (On Purpose)

- Shorts — filtered out, never appear anywhere
- Autoplay rabbit holes
- Recommendation engine pushing watch time
- Ad tech and tracking scripts
- Bloated page that kills CPU

---

## Future Ideas

- Block specific channels
- Filter videos by keyword in title
- Show only subscription feed on homepage
- Remember watch position locally
- Custom dark UI
