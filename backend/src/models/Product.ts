import mongoose, { Schema, Document, Types } from "mongoose";

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductFeature {
  title: string;
  description?: string;
  iconUrl?: string;
}

export interface ProductSpecification {
  group?: string;
  key?: string;
  name: string;
  value: string;
  unit?: string;
  sortOrder?: number;
}

export interface ProductDocument extends Document {
  name: string;
  slug: string;
  modelCode?: string;
  categoryId: Types.ObjectId;
  shortDescription?: string;
  description?: string;
  featured: boolean;
  isVisible: boolean;
  images: ProductImage[];
  features: ProductFeature[];
  specifications: ProductSpecification[];
  relatedProductIds: Types.ObjectId[];
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

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    modelCode: { type: String, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory", required: true, index: true },
    shortDescription: { type: String },
    description: { type: String },
    featured: { type: Boolean, default: false, index: true },
    isVisible: { type: Boolean, default: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 }
      }
    ],
    features: [
      {
        title: { type: String, required: true },
        description: { type: String },
        iconUrl: { type: String }
      }
    ],
    specifications: [
      {
        group: { type: String },
        key: { type: String },
        name: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        sortOrder: { type: Number }
      }
    ],
    relatedProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
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

export const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);

