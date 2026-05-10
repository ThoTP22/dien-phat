import { ktvHttp } from "@/lib/ktv-http";
import { apiEndpoints } from "@/lib/api";
import { setKtvTokenCookie, clearKtvTokenCookie } from "@/lib/ktv-cookie";
import type { RepairTicketStatus } from "@/services/repairTicket.service";

export type { RepairTicketStatus } from "@/services/repairTicket.service";

export interface KtvUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface KtvTicket {
  id: string;
  ticketNumber: string;
  ticketRefNumber?: string;
  status: RepairTicketStatus;
  serviceType: string;
  serviceLocation: string;
  isUrgent: boolean;
  productName?: string;
  manufacturer?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePlace?: string;
  faultDescription?: string;
  accessories?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  quotedPrice?: number;
  note?: string;
  internalNote?: string;
  receivedDate?: string;
  receivedBy?: string;
  appointmentDate?: string;
  completedDate?: string;
  images?: string[];
  intakeImages?: string[];
  faultImages?: string[];
  completedImages?: string[];
  statusImages?: Record<string, string[]>;
  tatMinutes?: number;
  tatLabel?: string;
  technician?: { id: string; fullName: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface KtvTicketListResult {
  items: KtvTicket[];
  total: number;
  page: number;
  limit: number;
}

export async function ktvLogin(email: string, password: string): Promise<KtvUser> {
  const res = await fetch(apiEndpoints.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include"
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Đăng nhập thất bại");
  }
  const { accessToken, user } = json.data as { accessToken: string; user: KtvUser };
  if (user.role !== "technician") {
    throw new Error("Tài khoản này không phải kỹ thuật viên. Vui lòng dùng tài khoản KTV.");
  }
  setKtvTokenCookie(accessToken);
  return user;
}

export function ktvLogout(): void {
  clearKtvTokenCookie();
}

export async function fetchMyTickets(params?: {
  status?: string;
  page?: number;
}): Promise<KtvTicketListResult> {
  const url = new URL(apiEndpoints.technician.myTickets);
  if (params?.status && params.status !== "all") url.searchParams.set("status", params.status);
  if (params?.page && params.page > 1) url.searchParams.set("page", String(params.page));

  const res = await ktvHttp.get<{ success: boolean; data: KtvTicketListResult }>(url.toString());
  if (!res.data?.success) throw new Error("Lỗi tải danh sách phiếu");
  return res.data.data;
}

export async function fetchMyTicketById(id: string): Promise<KtvTicket> {
  const res = await ktvHttp.get<{ success: boolean; data: KtvTicket }>(
    apiEndpoints.technician.myTicketDetail(id)
  );
  if (!res.data?.success) throw new Error("Lỗi tải chi tiết phiếu");
  return res.data.data;
}

export async function updateMyTicketStatus(
  id: string,
  payload: { status: RepairTicketStatus; internalNote?: string }
): Promise<KtvTicket> {
  const res = await ktvHttp.patch<{ success: boolean; data: KtvTicket }>(
    apiEndpoints.technician.updateMyTicketStatus(id),
    payload
  );
  if (!res.data?.success) throw new Error("Lỗi cập nhật trạng thái");
  return res.data.data;
}

export async function updateMyTicketImages(
  id: string,
  status: string,
  images: string[]
): Promise<KtvTicket> {
  const res = await ktvHttp.patch<{ success: boolean; data: KtvTicket }>(
    apiEndpoints.technician.updateMyTicketImages(id),
    { status, images }
  );
  if (!res.data?.success) throw new Error("Lỗi cập nhật ảnh");
  return res.data.data;
}

export interface TicketLogEntry {
  _id: string;
  action: string;
  userName?: string;
  createdAt: string;
  metadata?: { statusSlug?: string; images?: string[] };
}

export async function fetchMyTicketLogs(id: string): Promise<TicketLogEntry[]> {
  const res = await ktvHttp.get<{ success: boolean; data: TicketLogEntry[] }>(
    apiEndpoints.technician.myTicketLogs(id)
  );
  if (!res.data?.success) throw new Error("Lỗi tải lịch sử");
  return res.data.data;
}
