import { ProductCategoryDocument } from "../../models/ProductCategory";

export interface CategorySeoResponseDTO {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface CategoryParentDTO {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryResponseDTO {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: CategoryParentDTO | null;
  summary?: string;
  imageUrl?: string;
  sortOrder: number;
  isVisible: boolean;
  seo?: CategorySeoResponseDTO;
}

export interface PaginatedCategoriesResponseDTO {
  items: CategoryResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export const toCategoryResponse = (
  doc: ProductCategoryDocument
): CategoryResponseDTO => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  parentId: doc.parentId ? doc.parentId.toString() : null,
  summary: doc.summary,
  imageUrl: doc.imageUrl,
  sortOrder: doc.sortOrder,
  isVisible: doc.isVisible,
  seo: doc.seo
});

