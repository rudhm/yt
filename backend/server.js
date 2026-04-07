require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment (fixes OAuth HTTPS redirect_uri)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session configuration (needed for OAuth flow)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import Routes
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const subscriptionsRoutes = require('./routes/subscriptions');
// const videoRoutes = require('./routes/video');

// Use Routes
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
// app.use('/api/video', videoRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Custom YouTube Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Keep-alive ping endpoint for external monitoring
app.get('/ping', (req, res) => {
  res.json({ status: 'alive' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/`);
  console.log(`✓ Search API: http://localhost:${PORT}/api/search`);
  console.log(`✓ Auth API: http://localhost:${PORT}/api/auth/google`);
  console.log(`✓ Subscriptions API: http://localhost:${PORT}/api/subscriptions`);
});
