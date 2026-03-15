import { ProductFeature, ProductImage, ProductSpecification } from "../../models/Product";

export interface CreateProductRequestDTO {
  name: string;
  slug: string;
  modelCode?: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  featured?: boolean;
  isVisible?: boolean;
  images?: ProductImage[];
  features?: ProductFeature[];
  specifications?: ProductSpecification[];
  relatedProductIds?: string[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
}

export interface UpdateProductRequestDTO extends Partial<CreateProductRequestDTO> {}

