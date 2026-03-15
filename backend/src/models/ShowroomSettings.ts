import mongoose, { Schema, Document } from "mongoose";

export interface ShowroomAddress {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  fullText?: string;
}

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface ShowroomGalleryItem {
  url: string;
  alt?: string;
  sortOrder?: number;
  type?: "exterior" | "interior" | "other";
}

export interface ShowroomSettingsDocument extends Document {
  name: string;
  address: ShowroomAddress;
  phone?: string;
  email?: string;
  mapUrl?: string;
  intro?: string;
  openingHours: OpeningHour[];
  gallery: ShowroomGalleryItem[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const showroomSettingsSchema = new Schema<ShowroomSettingsDocument>(
  {
    name: { type: String, required: true },
    address: {
      street: { type: String },
      ward: { type: String },
      district: { type: String },
      province: { type: String },
      fullText: { type: String }
    },
    phone: { type: String },
    email: { type: String },
    mapUrl: { type: String },
    intro: { type: String },
    openingHours: [
      {
        day: { type: String, required: true },
        open: { type: String, required: true },
        close: { type: String, required: true },
        closed: { type: Boolean }
      }
    ],
    gallery: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        sortOrder: { type: Number },
        type: { type: String, enum: ["exterior", "interior", "other"], default: "other" }
      }
    ],
    seo: {
      title: { type: String },
      description: { type: String },
      canonicalUrl: { type: String },
      ogImage: { type: String }
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const ShowroomSettingsModel = mongoose.model<ShowroomSettingsDocument>(
  "ShowroomSettings",
  showroomSettingsSchema
);

