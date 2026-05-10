import {
  createRepairTicket,
  findRepairTicketById,
  listRepairTickets,
  updateRepairTicket,
  deleteRepairTicket,
  countByStatus,
  updateTicketStatusImages
} from "../repositories/repairTicket.repository";
import { createTicketLog, findTicketLogs } from "../repositories/ticketLog.repository";
import { RepairTicketDocument, RepairTicketStatus } from "../models/RepairTicket";

const STATUS_LABELS_VN: Record<string, string> = {
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

function formatTatLabel(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
}

export interface CreateRepairTicketPayload {
  ticketRefNumber?: string;
  serviceType?: string;
  serviceLocation?: string;
  isUrgent?: boolean;
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
  technician?: string;        // KTV nội bộ (User ObjectId)
  outsourcedTo?: string;      // Tên thợ ngoài
  intakeImages?: string[];
}

export interface UpdateRepairTicketPayload {
  ticketRefNumber?: string;
  status?: RepairTicketStatus;
  serviceType?: string;
  serviceLocation?: string;
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
  technician?: string | null;   // KTV nội bộ (User ObjectId | null = xóa)
  outsourcedTo?: string | null; // Tên thợ ngoài (null = xóa)
  intakeImages?: string[];
  faultImages?: string[];
  completedImages?: string[];
}

export interface ListRepairTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  technicianId?: string;
}

function toTicketResponse(doc: RepairTicketDocument) {
  const obj = doc.toObject({ virtuals: true });
  const tatMs = doc.receivedDate ? Date.now() - new Date(doc.receivedDate).getTime() : 0;
  return {
    id: doc._id.toString(),
    ticketNumber: doc.ticketNumber,
    ticketRefNumber: doc.ticketRefNumber,
    status: doc.status,
    serviceType: doc.serviceType,
    serviceLocation: doc.serviceLocation,
    isUrgent: doc.isUrgent,
    productName: doc.productName,
    manufacturer: doc.manufacturer,
    modelName: doc.modelName,
    serialNumber: doc.serialNumber,
    purchaseDate: doc.purchaseDate,
    purchasePlace: doc.purchasePlace,
    faultDescription: doc.faultDescription,
    accessories: doc.accessories,
    customerName: doc.customerName,
    customerPhone: doc.customerPhone,
    customerAddress: doc.customerAddress,
    area: doc.area,
    quotedPrice: doc.quotedPrice,
    note: doc.note,
    internalNote: doc.internalNote,
    receivedDate: doc.receivedDate,
    receivedBy: doc.receivedBy,
    appointmentDate: doc.appointmentDate,
    completedDate: doc.completedDate,
    technician: (obj as any).technician ?? null,
    outsourcedTo: doc.outsourcedTo ?? null,
    intakeImages: doc.intakeImages ?? [],
    faultImages: doc.faultImages ?? [],
    completedImages: doc.completedImages ?? [],
    statusImages: doc.statusImages ? Object.fromEntries(doc.statusImages as Map<string, string[]>) : {},
    tatMinutes: Math.floor(tatMs / 60000),
    tatLabel: tatMs > 0 ? formatTatLabel(tatMs) : "—",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export class RepairTicketService {
  async create(payload: CreateRepairTicketPayload, user?: { id: string; role: string }) {
    const data: any = { ...payload };
    // Auto-set trạng thái dựa trên phân công
    if (!data.status) {
      if (data.technician) {
        data.status = "assigned";
      } else if (data.outsourcedTo) {
        data.status = "outsourced";
      } else {
        data.status = "new";
      }
    }
    const doc = await createRepairTicket(data);
    // Log: tạo phiếu mới
    await createTicketLog({
      ticketId: doc._id.toString(),
      ticketNumber: doc.ticketNumber,
      action: `Tạo phiếu mới (trạng thái: ${STATUS_LABELS_VN[doc.status] ?? doc.status})`,
      userId: user?.id,
    }).catch(() => {/* không block nếu log lỗi */});
    return toTicketResponse(doc);
  }

  async list(params: ListRepairTicketsParams) {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 30;

    const query: any = {};

    if (params.status && params.status !== "all") {
      query.status = params.status;
    }

    if (params.technicianId) {
      const mongoose = await import("mongoose");
      query.technician = new mongoose.Types.ObjectId(params.technicianId);
    }

    if (params.search) {
      query.$or = [
        { ticketNumber: { $regex: params.search, $options: "i" } },
        { customerName: { $regex: params.search, $options: "i" } },
        { customerPhone: { $regex: params.search, $options: "i" } },
        { productName: { $regex: params.search, $options: "i" } },
        { serialNumber: { $regex: params.search, $options: "i" } }
      ];
    }

    const sort: any = { createdAt: -1 };

    const { items, total } = await listRepairTickets({ query, page, limit, sort });
    const statusCounts = await countByStatus();

    return {
      items: items.map(toTicketResponse),
      total,
      page,
      limit,
      statusCounts
    };
  }

  async getById(id: string) {
    const doc = await findRepairTicketById(id);
    if (!doc) throw new Error("Không tìm thấy phiếu bảo hành");
    return toTicketResponse(doc);
  }

  async update(id: string, payload: UpdateRepairTicketPayload, user?: { id: string; role: string }) {
    // Fetch existing for change detection
    const existing = await findRepairTicketById(id);
    if (!existing) throw new Error("Không tìm thấy phiếu bảo hành");

    const update: any = { ...payload };
    if (update.technician === "" || update.technician === null) {
      delete update.technician;
      if (!update.$unset) update.$unset = {};
      update.$unset.technician = 1;
    }
    if (update.outsourcedTo === "" || update.outsourcedTo === null) {
      delete update.outsourcedTo;
      if (!update.$unset) update.$unset = {};
      update.$unset.outsourcedTo = 1;
    }
    const doc = await updateRepairTicket(id, update);
    if (!doc) throw new Error("Không tìm thấy phiếu bảo hành");

    // Build change log entries
    const logActions: string[] = [];
    if (payload.status && payload.status !== existing.status) {
      const from = STATUS_LABELS_VN[existing.status] ?? existing.status;
      const to = STATUS_LABELS_VN[payload.status] ?? payload.status;
      logActions.push(`Đổi trạng thái: ${from} → ${to}`);
    }
    if (payload.technician !== undefined) {
      const oldId = existing.technician ? existing.technician.toString() : null;
      const newId = payload.technician === null || payload.technician === "" ? null : payload.technician;
      if (oldId !== newId) {
        if (!newId) {
          logActions.push("Bỏ phân công KTV");
        } else {
          const techName = (doc.toObject({ virtuals: true }) as any).technician?.fullName;
          logActions.push(`Phân công KTV: ${techName ?? newId}`);
        }
      }
    }
    if (payload.outsourcedTo !== undefined) {
      const oldVal = existing.outsourcedTo ?? null;
      const newVal = payload.outsourcedTo === null || payload.outsourcedTo === "" ? null : payload.outsourcedTo;
      if (oldVal !== newVal) {
        if (!newVal) {
          logActions.push("Bỏ giao thợ ngoài");
        } else {
          logActions.push(`Giao thợ ngoài: ${newVal}`);
        }
      }
    }
    for (const action of logActions) {
      await createTicketLog({
        ticketId: id,
        ticketNumber: doc.ticketNumber,
        action,
        userId: user?.id,
      }).catch(() => {/* không block nếu log lỗi */});
    }
    return toTicketResponse(doc);
  }

  async delete(id: string) {
    const success = await deleteRepairTicket(id);
    if (!success) throw new Error("Không tìm thấy phiếu bảo hành");
    return { deleted: true };
  }

  async getLogs(id: string) {
    const doc = await findRepairTicketById(id);
    if (!doc) throw new Error("Không tìm thấy phiếu bảo hành");
    return findTicketLogs(id);
  }

  async updateStatusImages(id: string, status: string, images: string[], user?: { id: string; role: string }) {
    const existing = await findRepairTicketById(id);
    if (!existing) throw new Error("Không tìm thấy phiếu bảo hành");
    await updateTicketStatusImages(id, status, images);
    const doc = await findRepairTicketById(id);
    if (!doc) throw new Error("Không tìm thấy phiếu bảo hành");
    const statusLabel = STATUS_LABELS_VN[status] ?? status;
    await createTicketLog({
      ticketId: id,
      ticketNumber: doc.ticketNumber,
      action: `Cập nhật ảnh trạng thái "${statusLabel}" (${images.length} ảnh)`,
      userId: user?.id,
      metadata: { statusSlug: status, images },
    }).catch(() => {/* không block nếu log lỗi */});
    return toTicketResponse(doc);
  }

  async exportCsv(params: ListRepairTicketsParams): Promise<string> {
    const query: any = {};
    if (params.status && params.status !== "all") {
      query.status = params.status;
    }
    if (params.search) {
      query.$or = [
        { ticketNumber: { $regex: params.search, $options: "i" } },
        { customerName: { $regex: params.search, $options: "i" } },
        { customerPhone: { $regex: params.search, $options: "i" } },
        { productName: { $regex: params.search, $options: "i" } },
        { serialNumber: { $regex: params.search, $options: "i" } }
      ];
    }
    const { items } = await listRepairTickets({ query, page: 1, limit: 5000, sort: { createdAt: -1 } });

    const esc = (v: any): string => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const headers = [
      "Số phiếu", "Ngày nhận", "Trạng thái", "Khách hàng", "SĐT", "Địa chỉ",
      "Sản phẩm", "Hãng", "Model", "Serial", "HT BH",
      "Báo giá", "KTV / Thợ ngoài", "Ngày hẹn", "Ngày hoàn thành",
      "Ghi chú", "Thời gian tồn (phút)", "Khẩn cấp"
    ];

    const rows = items.map((doc) => {
      const t = toTicketResponse(doc);
      const tech = (doc.toObject({ virtuals: true }) as any).technician?.fullName ?? doc.outsourcedTo ?? "";
      return [
        esc(t.ticketNumber),
        esc(t.receivedDate ? new Date(t.receivedDate).toLocaleDateString("vi-VN") : ""),
        esc(STATUS_LABELS_VN[t.status] ?? t.status),
        esc(t.customerName),
        esc(t.customerPhone),
        esc(t.customerAddress),
        esc(t.productName),
        esc(t.manufacturer),
        esc(t.modelName),
        esc(t.serialNumber),
        esc(t.serviceType),
        esc(t.quotedPrice ?? ""),
        esc(tech),
        esc(t.appointmentDate ? new Date(t.appointmentDate).toLocaleDateString("vi-VN") : ""),
        esc(t.completedDate ? new Date(t.completedDate).toLocaleDateString("vi-VN") : ""),
        esc(t.note),
        esc(t.tatMinutes),
        esc(t.isUrgent ? "Có" : "")
      ].join(",");
    });

    return ["\uFEFF" + headers.join(","), ...rows].join("\n");
  }
}
