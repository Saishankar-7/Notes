const mongoose = require('mongoose');

/**
 * Connect to MongoDB database with graceful fallback
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes_app';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/notes_app';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.warn(`[MongoDB] Primary connection failed (${primaryError.message})`);

    if (primaryUri !== localFallbackUri) {
      console.log(`[MongoDB] Trying local MongoDB fallback at ${localFallbackUri}...`);
      try {
        const localConn = await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Database connected to local fallback: ${localConn.connection.host}`);
        return localConn;
      } catch (fallbackError) {
        console.error(`[MongoDB] Local fallback also failed: ${fallbackError.message}`);
      }
    }

    console.error('[MongoDB] Could not establish database connection. Server will keep running, but DB operations will fail until resolved.');
  }
};

module.exports = connectDB;
