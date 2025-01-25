import { connectDB, getDB, getBucket } from '../src/config/db';

const testConnection = async () => {
  try {
    const connection = await connectDB();
    if (connection && connection.db && connection.bucket) {
      const { db, bucket } = connection;
      console.log('MongoDB connection test succeeded');
    } else {
      console.log('MongoDB connection test failed');
    }
  } catch (error) {
    console.error('Error during MongoDB connection test:', error);
  }
};

testConnection();