/**
 * Tạo user admin mẫu để đăng nhập admin.
 * Chạy: npx ts-node src/script/seed-admin.ts
 * Hoặc: npm run seed:admin (nếu đã thêm script trong package.json)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gold_shop_midea";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const existing = await UserModel.findOne({ email: ADMIN_EMAIL }).exec();
  if (existing) {
    console.log("Admin đã tồn tại:", ADMIN_EMAIL);
    process.exit(0);
    return;
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await UserModel.create({
    fullName: "Admin",
    email: ADMIN_EMAIL,
    passwordHash: hash,
    role: "admin",
    isActive: true,
  });
  console.log("Đã tạo admin:", ADMIN_EMAIL, "mật khẩu:", ADMIN_PASSWORD);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
