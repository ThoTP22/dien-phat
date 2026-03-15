import { FilterQuery } from "mongoose";
import { ProductDocument, ProductModel } from "../models/Product";

export const createProduct = async (
  payload: Partial<ProductDocument>
): Promise<ProductDocument> => {
  const doc = new ProductModel(payload);
  return doc.save();
};

export const findProductById = async (
  id: string
): Promise<ProductDocument | null> => {
  return ProductModel.findById(id).exec();
};

export const findProductBySlug = async (
  slug: string
): Promise<ProductDocument | null> => {
  return ProductModel.findOne({ slug }).lean().exec() as Promise<ProductDocument | null>;
};

export const listProducts = async (filter: {
  query: FilterQuery<ProductDocument>;
  page: number;
  limit: number;
  sort?: any;
}): Promise<{ items: ProductDocument[]; total: number }> => {
  const { query, page, limit, sort } = filter;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ProductModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
    ProductModel.countDocuments(query).exec()
  ]);

  return { items, total };
};

export const updateProduct = async (
  id: string,
  payload: Partial<ProductDocument>
): Promise<ProductDocument | null> => {
  return ProductModel.findByIdAndUpdate(id, payload, { new: true }).exec();
};

export const deleteProduct = async (id: string): Promise<void> => {
  await ProductModel.findByIdAndUpdate(
    id,
    { $set: { isVisible: false } },
    { new: false }
  ).exec();
};

