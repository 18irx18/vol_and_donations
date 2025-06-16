import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected.");
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB. MONGO_URL:", process.env.MONGO_URL ? "Set" : "Not Set");
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL environment variable is not set.");
    }

    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};