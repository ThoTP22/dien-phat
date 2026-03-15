import { z } from "zod";

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonicalUrl: z.string().url("canonicalUrl phải là URL hợp lệ").optional(),
    ogImage: z.string().url("ogImage phải là URL hợp lệ").optional()
  })
  .optional();

export const listCategoriesQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  search: z.string().optional(),
  parentId: z.string().optional(),
  rootOnly: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  status: z.string().optional(),
  includeHidden: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sort: z.string().optional()
});

export const createCategorySchema = z.object({
  name: z.string({ required_error: "Tên danh mục là bắt buộc" }).min(1, "Tên danh mục là bắt buộc"),
  slug: z.string({ required_error: "Slug là bắt buộc" }).min(1, "Slug là bắt buộc"),
  parentId: z.string().nullable().optional(),
  summary: z.string().optional(),
  imageUrl: z.string().url("imageUrl phải là URL hợp lệ").optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  seo: seoSchema
});

export const updateCategorySchema = createCategorySchema.partial();

