import mongoose, { Schema, Document, Types } from "mongoose";

export interface ProductCategoryDocument extends Document {
  name: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  summary?: string;
  imageUrl?: string;
  sortOrder: number;
  isVisible: boolean;
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

const productCategorySchema = new Schema<ProductCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null, index: true },
    summary: { type: String },
    imageUrl: { type: String },
    sortOrder: { type: Number, default: 0, index: true },
    isVisible: { type: Boolean, default: true, index: true },
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

export const ProductCategoryModel = mongoose.model<ProductCategoryDocument>(
  "ProductCategory",
  productCategorySchema
);

