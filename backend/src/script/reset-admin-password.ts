import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gold_shop_midea";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const NEW_PASSWORD = process.env.RESET_ADMIN_PASSWORD || "admin123";

async function reset() {
  await mongoose.connect(MONGODB_URI);

  const user = await UserModel.findOne({ email: ADMIN_EMAIL }).exec();
  if (!user) {
    console.log("Không tìm thấy user với email:", ADMIN_EMAIL);
    process.exit(1);
    return;
  }

  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  user.passwordHash = hash;
  user.isActive = true;
  await user.save();

  console.log("Đã reset mật khẩu admin:", ADMIN_EMAIL, "mật khẩu mới:", NEW_PASSWORD);
  process.exit(0);
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});

