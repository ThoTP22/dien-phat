import mongoose, { Schema, Document } from "mongoose";

export interface ReviewDocument extends Document {
  customerName: string;
  rating: number; // 1-5
  comment: string;
  productSlug?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    comment: { type: String, required: true },
    productSlug: { type: String, index: true },
    isApproved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

reviewSchema.index({ createdAt: -1 });

export const ReviewModel = mongoose.model<ReviewDocument>("Review", reviewSchema);
