const mongoose = require('mongoose');
const os = require('os');
const path = require('path');

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    let mongoUri = process.env.MONGODB_URI;

    // Zero-config developer fallback: If no MONGODB_URI is provided or memory is requested,
    // spin up an in-memory MongoDB instance automatically for instant local dev & testing.
    if (!mongoUri || mongoUri.trim() === '' || mongoUri === 'memory') {
      console.log('No MONGODB_URI provided in environment. Initializing local in-memory MongoDB...');
      if (!process.env.MONGOMS_DOWNLOAD_DIR) {
        process.env.MONGOMS_DOWNLOAD_DIR = path.join(os.tmpdir(), 'mongodb-binaries');
      }
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`In-memory MongoDB running at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 6000, // Timeout fast after 6 seconds so requests don't hang indefinitely
    });

    console.log(`✓ MongoDB Connected successfully: ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('👉 TIP: Ensure your MongoDB Atlas cluster has 0.0.0.0/0 added under "Network Access" in Atlas.');

    // In production or development, don't crash Express server with process.exit(1).
    // Keep server running to serve frontend and retry connection in background.
    if (process.env.NODE_ENV !== 'test') {
      console.log('⏳ Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;
