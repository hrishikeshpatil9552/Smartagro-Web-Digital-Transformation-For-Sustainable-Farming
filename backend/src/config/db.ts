import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load .env file

const MONGO_URI = process.env.MONGO_URI as string;

export const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};
