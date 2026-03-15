import {
  createProduct,
  deleteProduct,
  findProductById,
  findProductBySlug,
  listProducts,
  updateProduct
} from "../repositories/product.repository";
import {
  CreateProductRequestDTO,
  UpdateProductRequestDTO
} from "../dto/requests/product.dto";
import {
  PaginatedProductsResponseDTO,
  toProductResponse
} from "../dto/responses/product.dto";
import { presignPublicGetObjectUrl } from "../utils/s3-presign";
import { ProductModel } from "../models/Product";
import mongoose from "mongoose";

export class ProductService {
  async create(payload: CreateProductRequestDTO, userId?: string) {
    const doc = await createProduct({
      ...payload,
      featured: payload.featured ?? false,
      isVisible: payload.isVisible ?? true,
      createdBy: userId,
      updatedBy: userId
    } as any);

    return toProductResponse(doc);
  }

  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    includeSubcategories?: boolean;
    categorySlug?: string;
    featured?: boolean;
    includeHidden?: boolean;
    segment?: string;
    capacityBtu?: string;
    refrigerant?: string;
    origin?: string;
    technology?: string;
    type?: string;
    sort?: string;
  }): Promise<PaginatedProductsResponseDTO> {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 20;

    const query: any = {};
    if (!params.includeHidden) {
      query.isVisible = true;
    }

    if (params.search) {
      query.name = { $regex: params.search, $options: "i" };
    }

    if (params.featured !== undefined) {
      query.featured = params.featured;
    }

    if (params.categoryId && mongoose.isValidObjectId(params.categoryId)) {
      if (params.includeSubcategories) {
        const { findDescendantIds } = await import("../repositories/productCategory.repository");
        const ids = await findDescendantIds(params.categoryId);
        query.categoryId = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
      } else {
        query.categoryId = new mongoose.Types.ObjectId(params.categoryId);
      }
    }

    // categorySlug filtering sẽ cần join Category; để Phase 1 có thể bỏ qua hoặc xử lý sau.

    const specAll: any[] = [];

    if (params.capacityBtu) {
      specAll.push({ $elemMatch: { key: "capacity_btu", value: params.capacityBtu } });
    }
    if (params.refrigerant) {
      specAll.push({ $elemMatch: { key: "refrigerant", value: params.refrigerant } });
    }
    if (params.origin) {
      specAll.push({ $elemMatch: { key: "origin", value: params.origin } });
    }
    if (params.technology) {
      specAll.push({ $elemMatch: { key: "technology", value: params.technology } });
    }
    if (params.type) {
      specAll.push({ $elemMatch: { key: "type", value: params.type } });
    }
    if (params.segment) {
      // segment được hiểu là giá trị series động (vd: MSFQ, MSFQB, Celest / MSCE, ...).
      specAll.push({ $elemMatch: { key: "series", value: params.segment } });
    }

    if (specAll.length > 0) {
      query.specifications = { $all: specAll };
    }

    const sort: any = {};
    if (params.sort === "name_asc") sort.name = 1;
    else if (params.sort === "name_desc") sort.name = -1;
    else sort.createdAt = -1;

    const { items, total } = await listProducts({ query, page, limit, sort });

    const dtos = await Promise.all(
      items.map(async (doc) => {
        const dto = toProductResponse(doc);
        if (dto.images?.length) {
          dto.images = await Promise.all(
            dto.images.map(async (img) => ({
              ...img,
              url: await presignPublicGetObjectUrl({ urlOrKey: img.url, expiresInSeconds: 60 * 60 })
            }))
          );
        }
        return dto;
      })
    );

    return {
      items: dtos,
      total,
      page,
      limit
    };
  }

  async listSegments(): Promise<{ value: string; count: number }[]> {
    const docs = await ProductModel.aggregate([
      { $unwind: "$specifications" },
      { $match: { "specifications.key": "series" } },
      {
        $group: {
          _id: "$specifications.value",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();

    return docs.map((d: any) => ({
      value: d._id as string,
      count: d.count as number
    }));
  }

  async getBySlug(slug: string) {
    const doc = await findProductBySlug(slug);
    if (!doc || !doc.isVisible) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    const dto = toProductResponse(doc);
    if (dto.images?.length) {
      dto.images = await Promise.all(
        dto.images.map(async (img) => ({
          ...img,
          url: await presignPublicGetObjectUrl({ urlOrKey: img.url, expiresInSeconds: 60 * 60 })
        }))
      );
    }
    return dto;
  }

  async getAdminById(id: string) {
    const doc = await findProductById(id);
    if (!doc) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    return toProductResponse(doc);
  }

  async update(id: string, payload: UpdateProductRequestDTO, userId?: string) {
    const doc = await updateProduct(id, {
      ...payload,
      updatedBy: userId
    } as any);
    if (!doc) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    return toProductResponse(doc);
  }

  async softDelete(id: string) {
    await deleteProduct(id);
  }
}

