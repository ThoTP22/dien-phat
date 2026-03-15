import mongoose, { Schema, Document } from "mongoose";

export type LeadIntent = "consultation" | "survey" | "installation" | "general";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "spam";

export interface LeadDocument extends Document {
  fullName: string;
  phone: string;
  email?: string;
  intent?: LeadIntent;
  message?: string;
  sourcePage?: string;
  status: LeadStatus;
  note?: string;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<LeadDocument>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String },
    intent: {
      type: String,
      enum: ["consultation", "survey", "installation", "general"],
      default: "general",
      index: true
    },
    message: { type: String },
    sourcePage: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed", "spam"],
      default: "new",
      index: true
    },
    note: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });

export const LeadModel = mongoose.model<LeadDocument>("Lead", leadSchema);

