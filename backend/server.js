require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const searchRoutes = require('./routes/search');
// const videoRoutes = require('./routes/video');
// const authRoutes = require('./routes/auth');

// Use Routes
app.use('/api/search', searchRoutes);
// app.use('/api/video', videoRoutes);
// app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Custom YouTube Backend is running!',
    timestamp: new Date().toISOString()
  });
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
});
