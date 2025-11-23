import mongoose from "mongoose";

const DBconnect = async () => {
  try {
    if (!MONGO_URI) {
        throw new Error("MONGODB_URI is not defined in the environment variables.");
    }
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Exit process with failure
    process.exit(1); 
  }
};


export default DBconnect;