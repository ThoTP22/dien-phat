import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export type PostStatus = "draft" | "published" | "hidden";

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string; // HTML
  coverImageUrl?: string;
  status: PostStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  items: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePostPayload {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  status?: PostStatus;
  publishedAt?: string | null;
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
}

export async function fetchPublicPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedPosts> {
  const url = new URL(apiEndpoints.posts.listPublic);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể tải bài viết");
  return json.data as PaginatedPosts;
}

export async function fetchPublicPostDetail(slug: string): Promise<Post> {
  const res = await fetch(apiEndpoints.posts.publicDetail(slug), { next: { revalidate: 60 } });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể tải bài viết");
  return json.data as Post;
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const res = await adminHttp.post(apiEndpoints.posts.adminCreate, payload);
  if (!res.data?.success) throw new Error(res.data?.message || "Tạo bài viết thất bại");
  return res.data.data as Post;
}

