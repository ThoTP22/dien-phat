import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "content_staff";

export interface UserDocument extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "content_staff"],
      required: true,
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("User", userSchema);

