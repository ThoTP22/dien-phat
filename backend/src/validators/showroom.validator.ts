import { z } from "zod";

const addressSchema = z.object({
  street: z.string().optional(),
  ward: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  fullText: z.string().optional()
});

const openingHourSchema = z.object({
  day: z.string({ required_error: "Ngày là bắt buộc" }),
  open: z.string({ required_error: "Giờ mở cửa là bắt buộc" }),
  close: z.string({ required_error: "Giờ đóng cửa là bắt buộc" }),
  closed: z.boolean().optional()
});

const galleryItemSchema = z.object({
  url: z.string({ required_error: "URL hình ảnh là bắt buộc" }).url("URL không hợp lệ"),
  alt: z.string().optional(),
  sortOrder: z.number().int().optional(),
  type: z.enum(["exterior", "interior", "other"]).optional()
});

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonicalUrl: z.string().url("canonicalUrl phải là URL hợp lệ").optional(),
    ogImage: z.string().url("ogImage phải là URL hợp lệ").optional()
  })
  .optional();

export const upsertShowroomSchema = z.object({
  name: z.string({ required_error: "Tên showroom là bắt buộc" }),
  address: addressSchema,
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  mapUrl: z.string().url("mapUrl phải là URL hợp lệ").optional(),
  intro: z.string().optional(),
  openingHours: z.array(openingHourSchema),
  gallery: z.array(galleryItemSchema),
  seo: seoSchema
});

