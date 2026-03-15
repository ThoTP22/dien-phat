import {
  createCategory,
  deleteCategory,
  findCategoryById,
  findCategoryBySlug,
  listCategories,
  updateCategory
} from "../repositories/productCategory.repository";
import {
  CreateCategoryRequestDTO,
  UpdateCategoryRequestDTO
} from "../dto/requests/category.dto";
import {
  PaginatedCategoriesResponseDTO,
  toCategoryResponse
} from "../dto/responses/category.dto";

export class CategoryService {
  async create(payload: CreateCategoryRequestDTO, userId?: string) {
    const doc = await createCategory({
      name: payload.name,
      slug: payload.slug,
      parentId: payload.parentId || null,
      summary: payload.summary,
      imageUrl: payload.imageUrl,
      sortOrder: payload.sortOrder ?? 0,
      isVisible: payload.isVisible ?? true,
      seo: payload.seo,
      createdBy: userId,
      updatedBy: userId
    } as any);

    return toCategoryResponse(doc);
  }

  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string;
    rootOnly?: boolean;
    status?: string;
    includeHidden?: boolean;
    sort?: string;
  }): Promise<PaginatedCategoriesResponseDTO> {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 20;

    const query: any = {};

    if (params.search) {
      query.name = { $regex: params.search, $options: "i" };
    }

    if (params.parentId !== undefined) {
      query.parentId = params.parentId || null;
    } else if (params.rootOnly) {
      query.parentId = null;
    }

    if (!params.includeHidden) {
      query.isVisible = true;
    }

    const sort: any = {};
    if (params.sort === "name_asc") sort.name = 1;
    else if (params.sort === "name_desc") sort.name = -1;
    else sort.sortOrder = 1;

    const { items, total } = await listCategories({ query, page, limit, sort });

    return {
      items: items.map(toCategoryResponse),
      total,
      page,
      limit
    };
  }

  async getDescendantIds(parentId: string): Promise<string[]> {
    const { findDescendantIds } = await import("../repositories/productCategory.repository");
    return findDescendantIds(parentId);
  }

  async getBySlug(slug: string) {
    const doc = await findCategoryBySlug(slug);
    if (!doc || !doc.isVisible) {
      throw new Error("Không tìm thấy danh mục");
    }
    const dto = toCategoryResponse(doc);
    if (doc.parentId) {
      const parent = await findCategoryById(doc.parentId.toString());
      if (parent && parent.isVisible) {
        (dto as any).parent = {
          id: parent._id.toString(),
          name: parent.name,
          slug: parent.slug
        };
      }
    }
    return dto;
  }

  async getAdminById(id: string) {
    const doc = await findCategoryById(id);
    if (!doc) {
      throw new Error("Không tìm thấy danh mục");
    }
    return toCategoryResponse(doc);
  }

  async update(id: string, payload: UpdateCategoryRequestDTO, userId?: string) {
    const doc = await updateCategory(id, {
      ...payload,
      updatedBy: userId
    } as any);
    if (!doc) {
      throw new Error("Không tìm thấy danh mục");
    }
    return toCategoryResponse(doc);
  }

  async softDelete(id: string) {
    await deleteCategory(id);
  }
}

