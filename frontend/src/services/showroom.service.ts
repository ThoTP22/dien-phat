import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";
import { fetchWithTimeout } from "@/lib/fetch-api";

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

export interface Showroom {
  name: string;
  address: ShowroomAddress;
  phone?: string;
  email?: string;
  mapUrl?: string;
  intro?: string;
  openingHours: OpeningHour[];
  gallery: ShowroomGalleryItem[];
}

export async function fetchPublicShowroom(): Promise<Showroom | null> {
  const res = await fetchWithTimeout(apiEndpoints.showroom.public, {
    next: { revalidate: 60 }
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải thông tin showroom");
  }

  return json.data as Showroom | null;
}

export async function fetchAdminShowroom(token: string): Promise<Showroom | null> {
  const res = await adminHttp.get(apiEndpoints.showroom.admin);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải thông tin showroom");
  }
  return res.data.data as Showroom | null;
}

export async function upsertAdminShowroom(token: string, payload: Showroom): Promise<Showroom> {
  const res = await adminHttp.put(apiEndpoints.showroom.admin, payload);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Cập nhật showroom thất bại");
  }
  return res.data.data as Showroom;
}

