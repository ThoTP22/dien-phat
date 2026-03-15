export interface CategorySeoDTO {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface CreateCategoryRequestDTO {
  name: string;
  slug: string;
  parentId?: string | null;
  summary?: string;
  imageUrl?: string;
  isVisible?: boolean;
  sortOrder?: number;
  seo?: CategorySeoDTO;
}

export interface UpdateCategoryRequestDTO {
  name?: string;
  slug?: string;
  parentId?: string | null;
  summary?: string;
  imageUrl?: string;
  isVisible?: boolean;
  sortOrder?: number;
  seo?: CategorySeoDTO;
}

