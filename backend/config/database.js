import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[DB] Connected successfully");
  } catch (error) {
    console.error("[DB] Connection failed:", error.message);
    process.exit(1);
  }
};
