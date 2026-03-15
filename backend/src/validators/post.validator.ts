import { z } from "zod";

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonicalUrl: z.string().url("canonicalUrl phải là URL hợp lệ").optional(),
    ogImage: z.string().url("ogImage phải là URL hợp lệ").optional()
  })
  .optional();

export const listPostsQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  search: z.string().optional(),
  categorySlug: z.string().optional()
});

export const createPostSchema = z.object({
  title: z.string({ required_error: "Tiêu đề là bắt buộc" }).min(1, "Tiêu đề là bắt buộc"),
  slug: z.string({ required_error: "Slug là bắt buộc" }).min(1, "Slug là bắt buộc"),
  summary: z.string().optional(),
  content: z.string({ required_error: "Nội dung là bắt buộc" }).min(1, "Nội dung là bắt buộc"),
  coverImageUrl: z.string().url("coverImageUrl phải là URL hợp lệ").optional(),
  categoryId: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "hidden"]).optional(),
  seo: seoSchema
});

export const updatePostSchema = createPostSchema.partial();

