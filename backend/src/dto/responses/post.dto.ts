import { PostDocument } from "../../models/Post";

export interface PostResponseDTO {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  categoryId?: string | null;
  status: string;
  publishedAt?: string | null;
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPostsResponseDTO {
  items: PostResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export const toPostResponse = (doc: PostDocument): PostResponseDTO => ({
  id: doc._id.toString(),
  title: doc.title,
  slug: doc.slug,
  summary: doc.summary,
  content: doc.content,
  coverImageUrl: doc.coverImageUrl,
  categoryId: doc.categoryId ? doc.categoryId.toString() : null,
  status: doc.status,
  publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
  seo: doc.seo,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString()
});

