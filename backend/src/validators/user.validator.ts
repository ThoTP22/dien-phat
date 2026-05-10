import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.enum(["admin", "content_staff", "technician"])
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Tên phải ít nhất 2 ký tự").optional(),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự").optional(),
  role: z.enum(["admin", "content_staff", "technician"]).optional(),
  isActive: z.boolean().optional()
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["admin", "content_staff", "technician"]).optional(),
  isActive: z.string().optional()
});
