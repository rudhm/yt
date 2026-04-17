# Backend OAuth & Subscriptions API - Documentation

## Authentication Endpoints

### 1. Initiate Google OAuth
```
GET /api/auth/google
```

**Description:** Starts the OAuth flow, redirecting user to Google sign-in.

**Usage:**
```javascript
// Redirect user to this URL
window.location.href = 'http://localhost:5000/api/auth/google';
```

**Flow:**
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. User approves permissions
4. Google redirects back to `/api/auth/google/callback`
5. Backend stores encrypted OAuth state in an HttpOnly cookie
6. Backend generates JWT token
7. Redirects to frontend with token: `http://localhost:5173/?token=JWT_TOKEN`

---

### 2. OAuth Callback
```
GET /api/auth/google/callback
```

**Description:** Handles OAuth callback from Google (automatically called by Google).

**Returns:** Redirects to frontend with JWT token in URL parameter.

---

### 3. Get Current User
```
GET /api/auth/me
```

**Description:** Returns currently authenticated user's information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "user": {
    "id": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://photo.url"
  }
}
```

**Errors:**
- `401` - No token provided
- `403` - Invalid or expired token

---

### 4. Logout
```
POST /api/auth/logout
```

**Description:** Clears persisted OAuth cookie state and active OAuth tokens.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Note:** Frontend should also clear JWT from localStorage.

---

## Subscriptions Endpoints

### 1. Get User Subscriptions
```
GET /api/subscriptions
```

**Description:** Fetches list of channels the user is subscribed to.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "subscription_id",
      "channelId": "UC...",
      "channelTitle": "Channel Name",
      "channelThumbnail": "https://thumbnail.url",
      "description": "Channel description"
    }
  ],
  "totalResults": 50
}
```

**Errors:**
- `401` - Not authenticated or OAuth token expired
- `500` - Failed to fetch from YouTube API

---

### 2. Get Subscription Feed
```
GET /api/subscriptions/feed?maxResults=20
```

**Description:** Fetches latest videos from subscribed channels with Shorts filtering.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `maxResults` (optional) - Number of videos to return (default: 20)

**Response:**
```json
{
  "items": [
    {
      "kind": "youtube#searchResult",
      "id": {
        "videoId": "video_id"
      },
      "snippet": {
        "title": "Video title",
        "channelTitle": "Channel name",
        "thumbnails": { ... },
        "description": "Video description"
      }
    }
  ],
  "totalResults": 15,
  "filtered": "Shorts removed (duration < 4 minutes)"
}
```

**Filtering Logic:**
- Fetches activities from last 7 days
- Checks each video's duration
- Filters out videos < 4 minutes (removes Shorts)
- Returns only longer-form content

**Errors:**
- `401` - Not authenticated or OAuth token expired
- `500` - Failed to fetch from YouTube API

---

## JWT Token

### Token Structure
```json
{
  "id": "google_user_id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://photo.url",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Lifetime
- Expires in 365 days
- Frontend should retain token in localStorage for long-lived sessions

### Using Tokens in Frontend
```javascript
// Store token
localStorage.setItem('token', jwtToken);

// Add to API requests
axios.get('/api/subscriptions', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

## Environment Variables Required

```bash
# Backend .env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=random_secure_secret
SESSION_SECRET=another_secure_secret
OAUTH_COOKIE_ENCRYPTION_KEY=secure_cookie_encryption_secret
FRONTEND_URL=http://localhost:5173
YOUTUBE_API_KEY=your_youtube_api_key
```

---

## OAuth Scopes

The app requests these permissions:
- `profile` - Basic profile info
- `email` - User's email address
- `https://www.googleapis.com/auth/youtube.readonly` - Read-only access to YouTube data

**Note:** The app NEVER gets write access to the user's YouTube account.

---

## Security Features

1. **JWT Tokens:**
   - Signed with secret key
   - Time-limited (7 days)
   - Contains only necessary user info

2. **OAuth Tokens:**
   - Stored as encrypted `HttpOnly` backend cookie state
   - Never exposed to frontend JavaScript
   - Used only for YouTube API calls
   - Access token is automatically refreshed from refresh token when possible

3. **CORS:**
   - Restricted to frontend URL
   - Credentials allowed for OAuth flow

4. **Session:**
   - Temporary, only for OAuth flow
   - HTTP-only cookies in production

---

## Testing OAuth Flow

### Manual Test:

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Visit in browser:
   ```
   http://localhost:5000/api/auth/google
   ```

3. Sign in with Google

4. You'll be redirected to:
   ```
   http://localhost:5173/?token=YOUR_JWT_TOKEN
   ```

5. Test the token:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:5000/api/auth/me
   ```

### Expected Output:
```json
{
  "user": {
    "id": "...",
    "email": "your@email.com",
    "name": "Your Name",
    "picture": "https://..."
  }
}
```

---

## Troubleshooting

**"redirect_uri_mismatch"**
- Check Google Console redirect URI matches exactly
- For development: `http://localhost:5000/api/auth/google/callback`
- For production: `https://yt-lapop.onrender.com/api/auth/google/callback`

**"OAuth token expired"**
- Backend will auto-refresh access token using persisted refresh token
- Re-login is only required if refresh token is revoked/invalid

**"invalid_grant"**
- OAuth refresh token failed
- User needs to re-authenticate

**CORS errors**
- Check `FRONTEND_URL` in backend .env
- Verify frontend is on expected origin

---

## API Quota Usage

| Endpoint | YouTube API Units |
|---|---|
| `/api/subscriptions` | 1 unit per request |
| `/api/subscriptions/feed` | 1 + (1 per video checked) |

**Example:** Feed with 20 videos = ~21 units

**Optimization Tips:**
- Cache subscription data (channel list rarely changes)
- Limit feed requests (use pagination)
- Consider caching feed results for 5-10 minutes

---

## Next Steps

After backend is complete:
1. Frontend login UI
2. Token storage and management
3. Subscription feed page
4. Protected routes
5. Auto-refresh on token expiry
