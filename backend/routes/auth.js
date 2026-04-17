const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { generateToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');
const { refreshGoogleAccessToken } = require('../utils/googleOAuth');
const {
  readOAuthStateCookie,
  setOAuthStateCookie,
  clearOAuthStateCookie,
  hasFreshAccessToken
} = require('../utils/oauthCookies');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    proxy: true, // Trust proxy for HTTPS callback URL on Render
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0]?.value,
      accessToken,
      refreshToken
    };

    return done(null, user);
  }
));

// Serialize/deserialize for session (minimal, since we use JWT)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Initialize OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/youtube.readonly'
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

// OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: (process.env.FRONTEND_URL || 'https://yt-flame-five.vercel.app') + '/?error=auth_failed'
  }),
  (req, res) => {
    try {
      const existingState = readOAuthStateCookie(req);
      const existingRefreshToken = existingState?.userId === req.user.id ? existingState.refreshToken : null;
      const refreshToken = req.user.refreshToken || existingRefreshToken;

      if (!refreshToken) {
        const frontendURL = process.env.FRONTEND_URL || 'https://yt-flame-five.vercel.app';
        return res.redirect(`${frontendURL}/?error=missing_refresh_token`);
      }

      setOAuthStateCookie(res, {
        userId: req.user.id,
        accessToken: req.user.accessToken,
        accessTokenExpiresAt: Date.now() + (3540 * 1000),
        refreshToken
      });

      // Generate JWT token
      const token = generateToken(req.user);

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'https://yt-flame-five.vercel.app';
      res.redirect(`${frontendURL}/?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const frontendURL = process.env.FRONTEND_URL || 'https://yt-flame-five.vercel.app';
      res.redirect(`${frontendURL}/?error=token_generation_failed`);
    }
  }
);

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    }
  });
});

// Logout (client-side token removal is primary, this is for cleanup)
router.post('/logout', authenticateToken, (req, res) => {
  clearOAuthStateCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Helper function to get OAuth token for a user (used by other routes)
const getUserOAuthToken = async (req, res) => {
  const oauthState = readOAuthStateCookie(req);

  if (!oauthState || oauthState.userId !== req.user.id) {
    clearOAuthStateCookie(res);
    return null;
  }

  if (hasFreshAccessToken(oauthState)) {
    return oauthState.accessToken;
  }

  if (!oauthState.refreshToken) {
    clearOAuthStateCookie(res);
    return null;
  }

  try {
    const refreshed = await refreshGoogleAccessToken(oauthState.refreshToken);
    const nextState = {
      userId: req.user.id,
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: Date.now() + (refreshed.expiresIn * 1000),
      refreshToken: refreshed.refreshToken || oauthState.refreshToken
    };

    setOAuthStateCookie(res, nextState);
    return nextState.accessToken;
  } catch (error) {
    const message = error.response?.data?.error || error.message;
    console.error('OAuth token refresh failed:', message);

    if (error.response?.data?.error === 'invalid_grant') {
      clearOAuthStateCookie(res);
      return null;
    }

    throw error;
  }
};

module.exports = {
  router,
  getUserOAuthToken
};
