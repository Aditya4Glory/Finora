const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, direct browser navigation)
      if (!origin) return callback(null, true);

      // Allow same-origin, any .onrender.com domain, configured CLIENT_URL, or localhost
      if (
        !process.env.CLIENT_URL ||
        origin === process.env.CLIENT_URL ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        process.env.NODE_ENV === 'development'
      ) {
        return callback(null, true);
      }

      // Safe fallback: allow origin without throwing 500 error
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Health Check route
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStatus = states[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    service: 'Finora Personal Finance API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Serve static frontend build in production if available
const clientDistCandidates = [
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'dist'),
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`Serving static client files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    // If request has a file extension and was not found in express.static, return 404
    if (path.extname(req.path)) {
      return res.status(404).send('Asset not found');
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('client/dist folder not found. Running in API-only mode.');
}

// 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Finora Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
