# Custom YouTube Backend

Backend API server for the custom YouTube frontend. Filters out YouTube Shorts and provides a clean API for searching and viewing videos.

## Features

- ✅ YouTube Data API v3 integration
- ✅ Automatic Shorts filtering (excludes videos <4 minutes)
- ✅ **Google OAuth 2.0 authentication**
- ✅ **JWT-based user sessions**
- ✅ **Subscriptions API (fetch user's YouTube subscriptions)**
- ✅ **Subscription feed with Shorts filtering**
- ✅ CORS enabled for frontend integration
- ✅ Environment-based configuration
- ✅ Error handling and logging

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   YOUTUBE_API_KEY=your_actual_api_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_secure_random_secret
   SESSION_SECRET=another_secure_random_secret
   FRONTEND_URL=http://localhost:5173
   ```

3. **Get a YouTube API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable YouTube Data API v3
   - Create credentials → API Key
   - Copy the API key to your `.env` file

## Running Locally

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Google OAuth Login
```
GET /api/auth/google
```
Initiates Google OAuth flow for user sign-in.

#### OAuth Callback
```
GET /api/auth/google/callback
```
Handles Google OAuth callback (automatic).

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer JWT_TOKEN
```
Returns authenticated user's information.

#### Logout
```
POST /api/auth/logout
Authorization: Bearer JWT_TOKEN
```
Clears OAuth tokens.

### Search

#### Search Videos (Medium Duration)
```
GET /api/search?q=<query>&maxResults=<number>
```
Search for videos 4-20 minutes long (filters out Shorts).

**Parameters:**
- `q` (required): Search query
- `maxResults` (optional): Number of results (default: 20)

**Example:**
```bash
curl "http://localhost:5000/api/search?q=programming&maxResults=10"
```

#### Search Long Videos Only
```
GET /api/search/long?q=<query>&maxResults=<number>
```
Search for videos >20 minutes only.

### Subscriptions

#### Get User Subscriptions
```
GET /api/subscriptions
Authorization: Bearer JWT_TOKEN
```
Fetches user's subscribed YouTube channels.

#### Get Subscription Feed
```
GET /api/subscriptions/feed?maxResults=<number>
Authorization: Bearer JWT_TOKEN
```
Fetches latest videos from subscribed channels (Shorts filtered).

**Parameters:**
- `maxResults` (optional): Number of videos (default: 20)

See [OAUTH_API_DOCS.md](./OAUTH_API_DOCS.md) for detailed authentication documentation.

## Shorts Filtering

The backend filters YouTube Shorts using the `videoDuration` parameter:
- **medium**: 4-20 minutes (excludes Shorts)
- **long**: >20 minutes (excludes Shorts)

Since Shorts are typically <60 seconds, filtering for videos ≥4 minutes effectively removes all Shorts.

## Project Structure

```
backend/
├── server.js              # Main Express app
├── routes/
│   ├── search.js          # Search API with Shorts filtering
│   ├── auth.js            # Google OAuth & JWT authentication
│   └── subscriptions.js   # Subscriptions and feed API
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── utils/
│   └── jwt.js             # JWT token utilities
├── .env                   # Environment variables (not committed)
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies and scripts
├── README.md              # This file
└── OAUTH_API_DOCS.md      # OAuth API documentation
```

## Dependencies

- **express**: Web server framework
- **cors**: Enable cross-origin requests
- **dotenv**: Environment variable management
- **axios**: HTTP client for YouTube API calls
- **passport**: Authentication middleware
- **passport-google-oauth20**: Google OAuth 2.0 strategy
- **jsonwebtoken**: JWT token generation and verification
- **express-session**: Session management for OAuth flow
- **nodemon**: Auto-restart during development (dev only)

## Next Steps

- [x] OAuth 2.0 authentication implemented
- [x] Subscriptions API working
- [ ] Frontend login UI
- [ ] Subscription feed page
- [ ] Deploy to Render or similar hosting service

## API Quota

YouTube Data API v3 free tier: **10,000 units/day**
- Each search costs 100 units (~100 searches/day)
- Video details cost 1 unit each

For personal/household use, this is plenty. Implement caching if needed.
