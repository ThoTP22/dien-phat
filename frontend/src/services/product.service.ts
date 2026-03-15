import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductFeature {
  title: string;
  description?: string;
  iconUrl?: string;
}

export interface ProductSpecification {
  group?: string;
  key?: string;
  name: string;
  value: string;
  unit?: string;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  modelCode?: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  featured: boolean;
  isVisible: boolean;
  images: ProductImage[];
  features: ProductFeature[];
  specifications: ProductSpecification[];
  relatedProductIds: string[];
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductSegment {
  value: string;
  count: number;
}

export async function fetchPublicProductSegments(): Promise<ProductSegment[]> {
  const res = await fetch(apiEndpoints.products.segments, { next: { revalidate: 60 } });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải danh sách segment");
  }

  return (json.data ?? []) as ProductSegment[];
}

export async function fetchPublicProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  includeSubcategories?: boolean;
  categorySlug?: string;
  segment?: string;
  capacityBtu?: string;
  refrigerant?: string;
  origin?: string;
  technology?: string;
  type?: string;
  featured?: boolean;
  sort?: string;
}): Promise<PaginatedProducts> {
  const url = new URL(apiEndpoints.products.listPublic);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải danh sách sản phẩm");
  }

  return json.data as PaginatedProducts;
}

export async function fetchPublicProductDetail(slug: string): Promise<Product> {
  const res = await fetch(apiEndpoints.products.publicDetail(slug), {
    cache: "no-store"
  });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải sản phẩm");
  }

  return json.data as Product;
}

export async function fetchAdminProducts(_token: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  includeHidden?: boolean;
  featured?: boolean;
  sort?: string;
}): Promise<PaginatedProducts> {
  const url = new URL(apiEndpoints.products.adminList);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }
  if (!url.searchParams.has("includeHidden")) {
    url.searchParams.set("includeHidden", "true");
  }

  const res = await adminHttp.get(url.toString());
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải danh sách sản phẩm");
  }
  return res.data.data as PaginatedProducts;
}

export async function fetchAdminProductDetail(id: string): Promise<Product> {
  const res = await adminHttp.get(apiEndpoints.products.adminDetail(id));
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải sản phẩm");
  }
  return res.data.data as Product;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  modelCode?: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  featured?: boolean;
  isVisible?: boolean;
  images?: { url: string; alt?: string; isPrimary: boolean; sortOrder: number }[];
  features?: { title: string; description?: string; iconUrl?: string }[];
  specifications?: { group?: string; key?: string; name: string; value: string; unit?: string; sortOrder?: number }[];
  relatedProductIds?: string[];
  seo?: { title?: string; description?: string; canonicalUrl?: string; ogImage?: string };
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await adminHttp.post(apiEndpoints.products.adminCreate, payload);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Tạo sản phẩm thất bại");
  }
  return res.data.data as Product;
}

export async function deleteProduct(_token: string, id: string): Promise<void> {
  const res = await adminHttp.delete(apiEndpoints.products.adminDelete(id));
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Ẩn sản phẩm thất bại");
  }
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  modelCode?: string;
  categoryId?: string;
  shortDescription?: string;
  description?: string;
  featured?: boolean;
  isVisible?: boolean;
  images?: { url: string; alt?: string; isPrimary: boolean; sortOrder: number }[];
  specifications?: { group?: string; key?: string; name: string; value: string; unit?: string; sortOrder?: number }[];
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const res = await adminHttp.patch(apiEndpoints.products.adminUpdate(id), payload);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Cập nhật sản phẩm thất bại");
  }
  return res.data.data as Product;
}

