import { FilterQuery } from "mongoose";
import { PostDocument, PostModel } from "../models/Post";

export const createPost = async (payload: Partial<PostDocument>): Promise<PostDocument> => {
  const doc = new PostModel(payload);
  return doc.save();
};

export const findPostById = async (id: string): Promise<PostDocument | null> => {
  return PostModel.findById(id).exec();
};

export const findPostBySlug = async (slug: string): Promise<PostDocument | null> => {
  return PostModel.findOne({ slug }).exec();
};

export const listPosts = async (filter: {
  query: FilterQuery<PostDocument>;
  page: number;
  limit: number;
  sort?: any;
}): Promise<{ items: PostDocument[]; total: number }> => {
  const { query, page, limit, sort } = filter;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    PostModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
    PostModel.countDocuments(query).exec()
  ]);

  return { items, total };
};

export const updatePost = async (
  id: string,
  payload: Partial<PostDocument>
): Promise<PostDocument | null> => {
  return PostModel.findByIdAndUpdate(id, payload, { new: true }).exec();
};

export const hidePost = async (id: string): Promise<void> => {
  await PostModel.findByIdAndUpdate(
    id,
    { $set: { status: "hidden" } },
    { new: false }
  ).exec();
};

