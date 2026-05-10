import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export type RepairTicketStatus =
  | "new"
  | "assigned"
  | "quoted"
  | "pending_confirm"
  | "waiting_parts"
  | "parts_ready"
  | "customer_rejected"
  | "returned"
  | "repaired"
  | "delivered"
  | "cancelled"
  | "outsourced";

export type ServiceType = "warranty" | "warranty_repair" | "service";
export type ServiceLocation = "at_station" | "at_home";

export const STATUS_LABELS: Record<RepairTicketStatus, string> = {
  new: "Đã Tiếp Nhận",
  assigned: "Đã Điều Phối KTV",
  quoted: "Báo Giá",
  pending_confirm: "Chờ Xác Nhận",
  waiting_parts: "Chờ Linh Kiện",
  parts_ready: "Đã Có Linh Kiện",
  customer_rejected: "Hỏng Khách Trả Lại",
  returned: "Trả Lại",
  repaired: "Sửa Xong",
  delivered: "Đã Giao Cho Khách",
  cancelled: "Đã Giao Phiếu Hủy",
  outsourced: "Đã Giao Thợ Ngoài"
};

export const STATUS_COLORS: Record<RepairTicketStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  assigned: "bg-indigo-100 text-indigo-800",
  quoted: "bg-yellow-100 text-yellow-800",
  pending_confirm: "bg-orange-100 text-orange-800",
  waiting_parts: "bg-amber-100 text-amber-800",
  parts_ready: "bg-cyan-100 text-cyan-800",
  customer_rejected: "bg-red-100 text-red-800",
  returned: "bg-rose-100 text-rose-800",
  repaired: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
  outsourced: "bg-purple-100 text-purple-800"
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  warranty: "Bảo hành",
  warranty_repair: "BH sửa chữa",
  service: "Sửa dịch vụ"
};

export const SERVICE_LOCATION_LABELS: Record<ServiceLocation, string> = {
  at_station: "Tại TTBH",
  at_home: "Tại Nhà"
};

export const ALL_STATUSES: RepairTicketStatus[] = [
  "new", "assigned", "quoted", "pending_confirm",
  "waiting_parts", "parts_ready", "customer_rejected",
  "returned", "repaired", "delivered", "cancelled", "outsourced"
];

export interface TechnicianRef {
  id: string;
  fullName: string;
  email: string;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  ticketRefNumber?: string;
  status: RepairTicketStatus;
  serviceType: ServiceType;
  serviceLocation: ServiceLocation;
  isUrgent: boolean;
  productName?: string;
  manufacturer?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePlace?: string;
  faultDescription: string;
  accessories?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  area?: string;
  quotedPrice?: number;
  note?: string;
  internalNote?: string;
  receivedDate: string;
  receivedBy?: string;
  appointmentDate?: string;
  completedDate?: string;
  technician?: TechnicianRef | null;
  outsourcedTo?: string | null;   // Tên thợ ngoài
  intakeImages: string[];
  faultImages: string[];
  completedImages: string[];
  tatMinutes: number;
  tatLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketLog {
  _id: string;
  ticketId: string;
  ticketNumber: string;
  action: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface PaginatedRepairTickets {
  items: RepairTicket[];
  total: number;
  page: number;
  limit: number;
  statusCounts: Partial<Record<RepairTicketStatus, number>>;
}

export interface CreateRepairTicketPayload {
  ticketRefNumber?: string;
  serviceType: ServiceType;
  serviceLocation: ServiceLocation;
  isUrgent: boolean;
  productName?: string;
  manufacturer?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePlace?: string;
  faultDescription: string;
  accessories?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  area?: string;
  note?: string;
  receivedDate?: string;
  receivedBy?: string;
  appointmentDate?: string;
  technician?: string;        // KTV nội bộ (User ID)
  outsourcedTo?: string;      // Tên thợ ngoài
  intakeImages?: string[];
}

export interface UpdateRepairTicketPayload {
  ticketRefNumber?: string;
  status?: RepairTicketStatus;
  serviceType?: ServiceType;
  serviceLocation?: ServiceLocation;
  isUrgent?: boolean;
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
  area?: string;
  quotedPrice?: number;
  note?: string;
  internalNote?: string;
  receivedDate?: string;
  receivedBy?: string;
  appointmentDate?: string;
  completedDate?: string;
  technician?: string | null;    // KTV nội bộ (null = xóa)
  outsourcedTo?: string | null;  // Tên thợ ngoài (null = xóa)
  intakeImages?: string[];
  faultImages?: string[];
  completedImages?: string[];
}

export async function fetchAdminRepairTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedRepairTickets> {
  const url = new URL(apiEndpoints.repairTickets.adminList);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }
  const res = await adminHttp.get(url.toString());
  if (!res.data?.success) throw new Error(res.data?.message || "Không thể tải danh sách phiếu bảo hành");
  return res.data.data as PaginatedRepairTickets;
}

export async function fetchAdminRepairTicketById(id: string): Promise<RepairTicket> {
  const res = await adminHttp.get(apiEndpoints.repairTickets.adminDetail(id));
  if (!res.data?.success) throw new Error(res.data?.message || "Không tìm thấy phiếu bảo hành");
  return res.data.data as RepairTicket;
}

export async function createAdminRepairTicket(payload: CreateRepairTicketPayload): Promise<RepairTicket> {
  const res = await adminHttp.post(apiEndpoints.repairTickets.adminCreate, payload);
  if (!res.data?.success) throw new Error(res.data?.message || "Tạo phiếu bảo hành thất bại");
  return res.data.data as RepairTicket;
}

export async function updateAdminRepairTicket(id: string, payload: UpdateRepairTicketPayload): Promise<RepairTicket> {
  const res = await adminHttp.patch(apiEndpoints.repairTickets.adminUpdate(id), payload);
  if (!res.data?.success) throw new Error(res.data?.message || "Cập nhật phiếu bảo hành thất bại");
  return res.data.data as RepairTicket;
}

export async function deleteAdminRepairTicket(id: string): Promise<void> {
  const res = await adminHttp.delete(apiEndpoints.repairTickets.adminDelete(id));
  if (!res.data?.success) throw new Error(res.data?.message || "Xóa phiếu bảo hành thất bại");
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const url = apiEndpoints.users.adminList + "?isActive=true&role=technician";
  const res = await adminHttp.get(url);
  if (!res.data?.success) throw new Error(res.data?.message || "Không thể tải danh sách người dùng");
  return res.data.data as AdminUser[];
}

export async function fetchTicketLogs(id: string): Promise<TicketLog[]> {
  const res = await adminHttp.get(apiEndpoints.repairTickets.adminLogs(id));
  if (!res.data?.success) throw new Error(res.data?.message || "Không thể tải lịch sử phiếu");
  return res.data.data as TicketLog[];
}

export async function exportRepairTicketsCsv(params?: {
  status?: string;
  search?: string;
}): Promise<void> {
  const url = new URL(apiEndpoints.repairTickets.adminExport);
  if (params?.status && params.status !== "all") url.searchParams.set("status", params.status);
  if (params?.search) url.searchParams.set("search", params.search);
  const res = await adminHttp.get(url.toString(), { responseType: "blob" });
  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `phieu-bao-hanh-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function formatTat(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}n ${hours}g`;
  if (hours > 0) return `${hours}g`;
  return `${minutes}ph`;
}
