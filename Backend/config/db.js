const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdu_lost_found';

  try {
    // Attempt connecting to the configured URI with a 3-second timeout
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Could not connect to local/remote MongoDB at "${mongoURI}".`);
    console.log(`🔄 Attempting to initialize in-memory MongoDB fallback for testing & presentation...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB instance active: ${memUri}`);
      console.log(`💡 Note: Database is running in-memory. Set MONGO_URI in .env to use MongoDB Atlas or local persistent MongoDB.`);
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB fallback:`, memErr.message);
      console.error(`👉 Please ensure MongoDB is running or add a valid MONGO_URI (e.g. MongoDB Atlas) in Backend/.env`);
      throw err;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
