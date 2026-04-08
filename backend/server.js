require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// Trust proxy for Render deployment (fixes OAuth HTTPS redirect_uri)
app.set('trust proxy', 1);

// Middleware
const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : []),
]
  .map((origin) => origin && origin.trim())
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

const allowedOrigins = Array.from(new Set([
  ...configuredOrigins,
  'http://localhost:5173',
  'https://yt-flame-five.vercel.app'
]));

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Session configuration (needed for OAuth flow)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
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
app.use('/api/auth', authRoutes.router);
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

app.listen(PORT, BIND_HOST, () => {
  const publicHost = process.env.NODE_ENV === 'production' ? 'https://yt-lapop.onrender.com' : `http://localhost:${PORT}`;
  console.log(`✓ Server is running on ${BIND_HOST}:${PORT}`);
  console.log(`✓ Health check: ${publicHost}/`);
  console.log(`✓ Search API: ${publicHost}/api/search`);
  console.log(`✓ Auth API: ${publicHost}/api/auth/google`);
  console.log(`✓ Subscriptions API: ${publicHost}/api/subscriptions`);
});
