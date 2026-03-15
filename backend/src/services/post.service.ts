import {
  createPost,
  findPostById,
  findPostBySlug,
  hidePost,
  listPosts,
  updatePost
} from "../repositories/post.repository";
import { CreatePostRequestDTO, UpdatePostRequestDTO } from "../dto/requests/post.dto";
import { PaginatedPostsResponseDTO, toPostResponse } from "../dto/responses/post.dto";

export class PostService {
  async create(payload: CreatePostRequestDTO, userId?: string) {
    const publishedAt =
      payload.publishedAt === null || payload.publishedAt === undefined
        ? null
        : new Date(payload.publishedAt);

    const doc = await createPost({
      title: payload.title,
      slug: payload.slug,
      summary: payload.summary,
      content: payload.content,
      coverImageUrl: payload.coverImageUrl,
      categoryId: payload.categoryId || null,
      status: payload.status ?? "draft",
      publishedAt,
      seo: payload.seo,
      createdBy: userId,
      updatedBy: userId
    } as any);

    return toPostResponse(doc);
  }

  async listPublic(params: {
    page?: number;
    limit?: number;
    search?: string;
    categorySlug?: string;
  }): Promise<PaginatedPostsResponseDTO> {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 10;

    const query: any = { status: "published" };

    if (params.search) {
      query.title = { $regex: params.search, $options: "i" };
    }

    // categorySlug: chưa có post_categories nên bỏ qua ở Phase 1

    const { items, total } = await listPosts({
      query,
      page,
      limit,
      sort: { publishedAt: -1, createdAt: -1 }
    });

    return { items: items.map(toPostResponse), total, page, limit };
  }

  async getPublicBySlug(slug: string) {
    const doc = await findPostBySlug(slug);
    if (!doc || doc.status !== "published") {
      throw new Error("Không tìm thấy bài viết");
    }
    return toPostResponse(doc);
  }

  async getAdminById(id: string) {
    const doc = await findPostById(id);
    if (!doc) throw new Error("Không tìm thấy bài viết");
    return toPostResponse(doc);
  }

  async update(id: string, payload: UpdatePostRequestDTO, userId?: string) {
    const patch: any = { ...payload, updatedBy: userId };
    if (payload.publishedAt !== undefined) {
      patch.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : null;
    }

    const doc = await updatePost(id, patch);
    if (!doc) throw new Error("Không tìm thấy bài viết");
    return toPostResponse(doc);
  }

  async softDelete(id: string) {
    await hidePost(id);
  }
}

