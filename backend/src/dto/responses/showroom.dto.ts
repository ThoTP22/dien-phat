import { ShowroomSettingsDocument } from "../../models/ShowroomSettings";

export interface ShowroomAddressResponseDTO {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  fullText?: string;
}

export interface OpeningHourResponseDTO {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface ShowroomGalleryItemResponseDTO {
  url: string;
  alt?: string;
  sortOrder?: number;
  type?: "exterior" | "interior" | "other";
}

export interface ShowroomResponseDTO {
  name: string;
  address: ShowroomAddressResponseDTO;
  phone?: string;
  email?: string;
  mapUrl?: string;
  intro?: string;
  openingHours: OpeningHourResponseDTO[];
  gallery: ShowroomGalleryItemResponseDTO[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
}

export const toShowroomResponse = (
  doc: ShowroomSettingsDocument
): ShowroomResponseDTO => ({
  name: doc.name,
  address: doc.address,
  phone: doc.phone,
  email: doc.email,
  mapUrl: doc.mapUrl,
  intro: doc.intro,
  openingHours: doc.openingHours,
  gallery: doc.gallery,
  seo: doc.seo
});

