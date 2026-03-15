import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Đã kết nối MongoDB");
  } catch (error) {
    console.error("Kết nối MongoDB thất bại", error);
    process.exit(1);
  }
};

