const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdu_lost_found';

  try {
    // Attempt connecting to the configured URI with a 15-second timeout for cloud connections
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection failed at "${mongoURI}":`, err.message);

    // Only attempt in-memory server in local development if available
    if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`✅ In-Memory MongoDB instance active: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.warn(`Could not start in-memory MongoDB fallback:`, memErr.message);
      }
    }

    console.error(`👉 Important: On MongoDB Atlas, ensure '0.0.0.0/0' (Allow access from anywhere) is enabled under Network Access!`);
    throw err;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
