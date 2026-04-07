# Phase 3: Google OAuth 2.0 Setup Guide

## Overview
This guide will help you add Google OAuth 2.0 authentication to your Custom YouTube app, enabling users to sign in and access their YouTube subscriptions.

## Prerequisites
- Existing Google Cloud Console project with YouTube Data API v3 enabled
- Backend and frontend running locally

---

## Part 1: Google Cloud Console Setup

### Step 1: Navigate to OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your existing project (the one with YouTube Data API v3)
3. In the left sidebar, navigate to:
   - **APIs & Services** → **OAuth consent screen**

### Step 2: Configure OAuth Consent Screen

**If not already configured:**

1. Choose **External** user type (for personal use)
2. Click **Create**
3. Fill in the required fields:
   - **App name**: My YouTube (or your preferred name)
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**

**Scopes:**

1. Click **Add or Remove Scopes**
2. Select these scopes:
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. Click **Update** → **Save and Continue**

**Test Users (for development):**

1. Click **Add Users**
2. Add your Google account email
3. Click **Save and Continue**

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to: **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Choose **Application type**: Web application
4. **Name**: My YouTube Web Client
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:5173`
   - Add: `http://localhost:5000`
6. **Authorized redirect URIs**:
   - Add: `http://localhost:5000/api/auth/google/callback`
   - For future production, also add:
     - `https://your-backend.onrender.com/api/auth/google/callback`
7. Click **Create**

### Step 4: Save Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456`)

**Important:** Copy both values immediately!

---

## Part 2: Configure Backend Environment

1. **Edit `backend/.env` file:**

```bash
# Existing variables
PORT=5000
YOUTUBE_API_KEY=AIzaSy...your_existing_key

# Add these OAuth variables
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
JWT_SECRET=my_super_secure_random_secret_key_change_this
SESSION_SECRET=another_random_secret_for_sessions_change_this
FRONTEND_URL=http://localhost:5173

# For production (leave commented for now)
# FRONTEND_URL=https://your-app.vercel.app
```

2. **Generate secure secrets:**

You can generate random secrets with this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice to get two different secrets for JWT_SECRET and SESSION_SECRET.

---

## Part 3: Install Backend Dependencies

```bash
cd /home/rudhm/code/my-youtube/backend
npm install passport passport-google-oauth20 jsonwebtoken express-session
```

---

## Part 4: Configure Frontend Environment

1. **Edit `frontend/.env` file:**

```bash
# Existing variable
VITE_API_URL=http://localhost:5000

# Add Google Client ID (public, safe to expose)
VITE_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

**Note:** Only add the Client ID to the frontend. NEVER add the Client Secret to frontend code!

---

## Part 5: Verification Checklist

Before proceeding with implementation, verify:

- ✅ OAuth consent screen configured
- ✅ YouTube readonly scope added
- ✅ Test user (your email) added
- ✅ OAuth Client ID created
- ✅ Redirect URI: `http://localhost:5000/api/auth/google/callback` added
- ✅ Client ID and Secret copied
- ✅ Backend `.env` updated with OAuth credentials
- ✅ Frontend `.env` updated with Client ID
- ✅ JWT_SECRET and SESSION_SECRET generated
- ✅ Dependencies installed

---

## Security Notes

1. **Never commit secrets to Git:**
   - `.env` files are already in `.gitignore`
   - Double-check before committing

2. **Rotate secrets in production:**
   - Use different secrets for production
   - Store them securely in Render/Vercel dashboards

3. **OAuth Scopes:**
   - We only request `youtube.readonly` (read-only access)
   - No permissions to modify user's YouTube account

4. **Test User Limit:**
   - During development, you're limited to 100 test users
   - Publish the OAuth consent screen before going live

---

## Troubleshooting

**Error: redirect_uri_mismatch**
- Verify redirect URI in Google Console matches exactly
- Check for typos, trailing slashes, http vs https

**Error: access_denied**
- Make sure your Google account is added as a test user
- Check OAuth consent screen is configured

**Error: invalid_client**
- Double-check Client ID and Secret in `.env`
- Restart backend server after changing `.env`

---

## Next Steps

Once setup is complete, I'll implement:
1. Backend OAuth routes (`/api/auth/google`, `/callback`)
2. JWT token generation and verification
3. Subscriptions API endpoint
4. Frontend login UI
5. Subscription feed page

Ready to proceed? Let me know when you've completed the Google Cloud Console setup!
