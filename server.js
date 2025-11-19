/**
 * Skill Mint Server
 * Node.js Express API Server
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/skill-mint', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Skill Mint Server is running',
    version: '1.0.0'
  });
});

// Health check endpoint for Render.com
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/skill-mint/login`);
});

module.exports = app;
