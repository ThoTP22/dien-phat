import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (opts?: { exitOnError?: boolean }): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Đã kết nối MongoDB");
  } catch (error) {
    console.error("Kết nối MongoDB thất bại", error);
    if (opts?.exitOnError !== false) process.exit(1);
    throw error;
  }
};

