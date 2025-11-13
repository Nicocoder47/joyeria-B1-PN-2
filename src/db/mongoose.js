import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.warn('MONGO_URI not set. Connect will fail until you set it in .env');
}

export async function connect() {
  try {
    await mongoose.connect(MONGO_URI, { 
      dbName: 'joyasDB',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.warn('Mongo connection error (fallback to file-based mode):', error.message);
    // Fallback
  }
}

export default mongoose;
