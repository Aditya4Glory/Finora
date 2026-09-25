const mongoose = require('mongoose');
const os = require('os');
const path = require('path');

const connectDB = async () => {
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

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
