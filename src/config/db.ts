import mongoose from 'mongoose';
import dotenv from 'dotenv';

const connectDB = async () => {
    // console.log("Prachi", process.env.MONGO_URI);
  try {
    
    // const DB = await mongoose.connect(process.env.MONGO_URI as string);
    const DB = await mongoose.connect('mongodb://localhost:27017/mydatabase');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    // console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
