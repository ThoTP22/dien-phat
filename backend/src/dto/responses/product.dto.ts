import { ProductDocument } from "../../models/Product";
import { env } from "../../configs/env";

function toAbsoluteImageUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const key = trimmed.replace(/^\/+/, "");
  return `https://${env.s3BucketName}.s3.${env.s3Region}.amazonaws.com/${key}`;
}

export interface ProductResponseDTO {
  id: string;
  name: string;
  slug: string;
  modelCode?: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  featured: boolean;
  isVisible: boolean;
  images: {
    url: string;
    alt?: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  features: {
    title: string;
    description?: string;
    iconUrl?: string;
  }[];
  specifications: {
    group?: string;
    name: string;
    value: string;
    unit?: string;
    sortOrder?: number;
  }[];
  relatedProductIds: string[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
}

export interface PaginatedProductsResponseDTO {
  items: ProductResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export const toProductResponse = (doc: ProductDocument): ProductResponseDTO => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  modelCode: doc.modelCode,
  categoryId: doc.categoryId.toString(),
  shortDescription: doc.shortDescription,
  description: doc.description,
  featured: doc.featured,
  isVisible: doc.isVisible,
  images: (doc.images || []).map((img: { url?: string; alt?: string; isPrimary?: boolean; sortOrder?: number }, i: number) => ({
    url: toAbsoluteImageUrl(img.url ?? ""),
    alt: img.alt,
    isPrimary: img.isPrimary ?? false,
    sortOrder: img.sortOrder ?? i
  })),
  features: doc.features,
  specifications: doc.specifications,
  relatedProductIds: doc.relatedProductIds.map((id) => id.toString()),
  seo: doc.seo
});

