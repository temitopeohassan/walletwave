import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('❌ MONGODB_URI is not defined in environment variables.');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};
