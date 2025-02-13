import * as db from '../src/config/db';

const testConnection = async () => {
  try {
    const connection = await db.connectToMongoDB();
    if (connection && connection.db && connection.bucket) {
      const { db, bucket } = connection;
      console.log('MongoDB connection test succeeded');
    } else {
      console.log('MongoDB connection test failed');
    }
  } catch (error) {
    logInfo('Error during MongoDB connection test:', error);
  }
};

testConnection();