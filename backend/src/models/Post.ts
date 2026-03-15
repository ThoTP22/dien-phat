import mongoose, { Schema, Document, Types } from "mongoose";

export type PostStatus = "draft" | "published" | "hidden";

export interface PostDocument extends Document {
  title: string;
  slug: string;
  summary?: string;
  content: string; // HTML
  coverImageUrl?: string;
  categoryId?: Types.ObjectId | null;
  status: PostStatus;
  publishedAt?: Date | null;
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    categoryId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
      index: true
    },
    publishedAt: { type: Date, default: null, index: true },
    seo: {
      title: { type: String },
      description: { type: String },
      canonicalUrl: { type: String },
      ogImage: { type: String }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const PostModel = mongoose.model<PostDocument>("Post", postSchema);

