const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend static assets so entire project runs seamlessly on port 5000
const frontendPath = path.join(__dirname, '../Frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/items', require('./routes/items'));
app.use('/api/stats', require('./routes/stats'));

const mongoose = require('mongoose');

// Health check
app.get('/api/health', (req, res) => {
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    database: stateMap[dbState] || 'unknown',
    databaseConnected: dbState === 1,
    timestamp: new Date().toISOString(),
    service: 'SDU Lost & Found Portal API'
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to Database & Start Server
const startServer = async () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SDU Lost & Found Server running on port ${PORT}`);
    console.log(`📡 API Endpoints available at /api/items`);
    console.log(`📊 Stats endpoint available at /api/stats`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error('⚠️ Database connection error:', error.message);
  }

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
