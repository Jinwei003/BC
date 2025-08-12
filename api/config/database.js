import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Use MongoDB Memory Server for development if no valid connection string
    let mongoUri = process.env.MONGODB_URI;
    
    // Check if MongoDB URI is provided
    if (!mongoUri) {
      console.log('MongoDB URI not provided, using mock database for development');
      global.mockDatabase = true;
      console.log('Mock database mode enabled - all database operations will use mock data');
      return;
    }
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.log('Enabling mock database mode for development');
    global.mockDatabase = true;
  }
};

export default connectDB;