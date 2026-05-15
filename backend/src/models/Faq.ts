import mongoose, { Schema, Document } from "mongoose";

export interface FaqDocument extends Document {
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<FaqDocument>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "" },
    sortOrder: { type: Number, default: 0, index: true },
    isVisible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const FaqModel = mongoose.model<FaqDocument>("Faq", faqSchema);
