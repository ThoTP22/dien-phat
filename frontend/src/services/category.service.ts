import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export interface CategoryParent {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: CategoryParent | null;
  summary?: string;
  imageUrl?: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface PaginatedCategories {
  items: Category[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchPublicCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  rootOnly?: boolean;
  sort?: string;
}): Promise<PaginatedCategories> {
  const url = new URL(apiEndpoints.categories.listPublic);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "")) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải danh sách danh mục");
  }

  return json.data as PaginatedCategories;
}

export async function fetchPublicCategoryDetail(slug: string): Promise<Category> {
  const res = await fetch(apiEndpoints.categories.publicDetail(slug), {
    next: { revalidate: 60 }
  });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải danh mục");
  }

  return json.data as Category;
}

export async function fetchAdminCategories(token: string, params?: {
  page?: number;
  limit?: number;
  parentId?: string | null;
  rootOnly?: boolean;
  includeHidden?: boolean;
}): Promise<PaginatedCategories> {
  const url = new URL(apiEndpoints.categories.listPublic);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  url.searchParams.set("includeHidden", "true");

  const res = await adminHttp.get(url.toString());
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải danh sách danh mục");
  }
  return res.data.data as PaginatedCategories;
}

export interface CategorySeoPayload {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string | null;
  summary?: string;
  imageUrl?: string;
  isVisible?: boolean;
  sortOrder?: number;
  seo?: CategorySeoPayload;
}

export async function createCategory(token: string, payload: CreateCategoryPayload): Promise<Category> {
  const res = await adminHttp.post(apiEndpoints.categories.adminCreate, payload);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Tạo danh mục thất bại");
  }
  return res.data.data as Category;
}

export async function deleteCategory(token: string, id: string): Promise<void> {
  const res = await adminHttp.delete(apiEndpoints.categories.adminDelete(id));
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Ẩn danh mục thất bại");
  }
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parentId?: string | null;
  summary?: string;
  imageUrl?: string;
  isVisible?: boolean;
  sortOrder?: number;
  seo?: CategorySeoPayload;
}

export async function fetchAdminCategoryDetail(token: string, id: string): Promise<Category> {
  const res = await adminHttp.get(apiEndpoints.categories.adminDetail(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải danh mục");
  }
  return res.data.data as Category;
}

export async function updateCategory(
  token: string,
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const res = await adminHttp.patch(apiEndpoints.categories.adminUpdate(id), payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Cập nhật danh mục thất bại");
  }
  return res.data.data as Category;
}

