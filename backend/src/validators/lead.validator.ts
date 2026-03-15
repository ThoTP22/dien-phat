import { z } from "zod";

export const createLeadSchema = z.object({
  fullName: z.string({ required_error: "Họ tên là bắt buộc" }).min(1, "Họ tên là bắt buộc"),
  phone: z.string({ required_error: "Số điện thoại là bắt buộc" }).min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional(),
  intent: z.enum(["consultation", "survey", "installation", "general"]).optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional()
});

export const listLeadsQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  intent: z.string().optional()
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "closed", "spam"], {
    required_error: "Trạng thái là bắt buộc"
  }),
  note: z.string().optional()
});

