export interface PostSeoDTO {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface CreatePostRequestDTO {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  categoryId?: string | null;
  publishedAt?: string | null;
  status?: "draft" | "published" | "hidden";
  seo?: PostSeoDTO;
}

export interface UpdatePostRequestDTO extends Partial<CreatePostRequestDTO> {}

