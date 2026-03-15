import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url("url phải là URL hợp lệ"),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

const featureSchema = z.object({
  title: z.string({ required_error: "Tiêu đề tính năng là bắt buộc" }),
  description: z.string().optional(),
  iconUrl: z.string().url("iconUrl phải là URL hợp lệ").optional()
});

const specificationSchema = z.object({
  group: z.string().optional(),
  name: z.string({ required_error: "Tên thông số là bắt buộc" }),
  value: z.string({ required_error: "Giá trị thông số là bắt buộc" }),
  unit: z.string().optional(),
  sortOrder: z.number().int().optional()
});

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonicalUrl: z.string().url("canonicalUrl phải là URL hợp lệ").optional(),
    ogImage: z.string().url("ogImage phải là URL hợp lệ").optional()
  })
  .optional();

export const listProductsQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  includeSubcategories: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  categorySlug: z.string().optional(),
  segment: z.string().optional(),
  capacityBtu: z.string().optional(),
  refrigerant: z.string().optional(),
  origin: z.string().optional(),
  technology: z.string().optional(),
  type: z.string().optional(),
  featured: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  includeHidden: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sort: z.string().optional()
});

export const createProductSchema = z.object({
  name: z.string({ required_error: "Tên sản phẩm là bắt buộc" }).min(1, "Tên sản phẩm là bắt buộc"),
  slug: z.string({ required_error: "Slug là bắt buộc" }).min(1, "Slug là bắt buộc"),
  modelCode: z.string().optional(),
  categoryId: z.string({ required_error: "categoryId là bắt buộc" }),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  featured: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  images: z.array(imageSchema).optional(),
  features: z.array(featureSchema).optional(),
  specifications: z.array(specificationSchema).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  seo: seoSchema
});

export const updateProductSchema = createProductSchema.partial();

