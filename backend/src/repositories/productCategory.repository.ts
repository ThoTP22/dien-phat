import mongoose, { FilterQuery } from "mongoose";
import {
  ProductCategoryDocument,
  ProductCategoryModel
} from "../models/ProductCategory";

export const findDescendantIds = async (parentId: string): Promise<string[]> => {
  const ids: string[] = [parentId];
  let current: mongoose.Types.ObjectId[] = [new mongoose.Types.ObjectId(parentId)];

  while (current.length > 0) {
    const children = await ProductCategoryModel.find({
      parentId: { $in: current }
    })
      .select("_id")
      .lean()
      .exec();

    const next = children.map((c) => c._id as mongoose.Types.ObjectId);
    ids.push(...next.map((id) => id.toString()));
    current = next;
  }

  return ids;
};

export const createCategory = async (
  payload: Partial<ProductCategoryDocument>
): Promise<ProductCategoryDocument> => {
  const doc = new ProductCategoryModel(payload);
  return doc.save();
};

export const findCategoryById = async (
  id: string
): Promise<ProductCategoryDocument | null> => {
  return ProductCategoryModel.findById(id).exec();
};

export const findCategoryBySlug = async (
  slug: string
): Promise<ProductCategoryDocument | null> => {
  return ProductCategoryModel.findOne({ slug }).exec();
};

export const listCategories = async (filter: {
  query: FilterQuery<ProductCategoryDocument>;
  page: number;
  limit: number;
  sort?: any;
}): Promise<{ items: ProductCategoryDocument[]; total: number }> => {
  const { query, page, limit, sort } = filter;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ProductCategoryModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
    ProductCategoryModel.countDocuments(query).exec()
  ]);

  return { items, total };
};

export const updateCategory = async (
  id: string,
  payload: Partial<ProductCategoryDocument>
): Promise<ProductCategoryDocument | null> => {
  return ProductCategoryModel.findByIdAndUpdate(id, payload, { new: true }).exec();
};

export const deleteCategory = async (id: string): Promise<void> => {
  await ProductCategoryModel.findByIdAndUpdate(
    id,
    { $set: { isVisible: false } },
    { new: false }
  ).exec();
};

