export interface ShowroomAddressDTO {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  fullText?: string;
}

export interface OpeningHourDTO {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface ShowroomGalleryItemDTO {
  url: string;
  alt?: string;
  sortOrder?: number;
  type?: "exterior" | "interior" | "other";
}

export interface UpsertShowroomRequestDTO {
  name: string;
  address: ShowroomAddressDTO;
  phone?: string;
  email?: string;
  mapUrl?: string;
  intro?: string;
  openingHours: OpeningHourDTO[];
  gallery: ShowroomGalleryItemDTO[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
}

