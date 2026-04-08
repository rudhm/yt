const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { generateToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

// In-memory store for OAuth tokens (in production, use a database)
const userTokens = new Map();

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
    // Store OAuth tokens for this user
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0]?.value,
      accessToken,
      refreshToken
    };

    // Store the OAuth tokens for later API calls
    userTokens.set(profile.id, {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (3540 * 1000) // 59 minutes (conservative)
    });

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
    failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/?error=auth_failed'
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user);

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendURL}/?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
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
  // Remove stored OAuth tokens
  userTokens.delete(req.user.id);
  
  res.json({ message: 'Logged out successfully' });
});

// Helper function to get OAuth token for a user (used by other routes)
const getUserOAuthToken = (userId) => {
  const tokens = userTokens.get(userId);
  if (!tokens || tokens.expiresAt < Date.now()) {
    return null;
  }
  return tokens.accessToken;
};

module.exports = {
  router,
  getUserOAuthToken
};
