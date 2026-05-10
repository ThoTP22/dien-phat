import { z } from "zod";

const statusEnum = z.enum([
  "new", "assigned", "quoted", "pending_confirm",
  "waiting_parts", "parts_ready", "customer_rejected",
  "returned", "repaired", "delivered", "cancelled", "outsourced"
]);

const serviceTypeEnum = z.enum(["warranty", "warranty_repair", "service"]);
const serviceLocationEnum = z.enum(["at_station", "at_home"]);

export const createRepairTicketSchema = z.object({
  ticketRefNumber: z.string().optional(),
  serviceType: serviceTypeEnum.default("warranty"),
  serviceLocation: serviceLocationEnum.default("at_station"),
  isUrgent: z.boolean().default(false),

  productName: z.string().optional(),
  manufacturer: z.string().optional(),
  modelName: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePlace: z.string().optional(),
  faultDescription: z.string({ required_error: "Mô tả hư hỏng là bắt buộc" }).min(1, "Mô tả hư hỏng là bắt buộc"),
  accessories: z.string().optional(),

  customerName: z.string({ required_error: "Tên khách hàng là bắt buộc" }).min(1, "Tên khách hàng là bắt buộc"),
  customerPhone: z.string({ required_error: "Số điện thoại là bắt buộc" }).min(8, "Số điện thoại không hợp lệ"),
  customerAddress: z.string().optional(),
  area: z.string().optional(),

  note: z.string().optional(),
  receivedDate: z.string().optional(),
  receivedBy: z.string().optional(),
  appointmentDate: z.string().optional(),
  technician: z.string().optional(),
  images: z.array(z.string()).optional()
});

export const updateRepairTicketSchema = z.object({
  ticketRefNumber: z.string().optional(),
  status: statusEnum.optional(),
  serviceType: serviceTypeEnum.optional(),
  serviceLocation: serviceLocationEnum.optional(),
  isUrgent: z.boolean().optional(),

  productName: z.string().optional(),
  manufacturer: z.string().optional(),
  modelName: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePlace: z.string().optional(),
  faultDescription: z.string().optional(),
  accessories: z.string().optional(),

  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  area: z.string().optional(),

  quotedPrice: z.number().optional(),
  note: z.string().optional(),
  internalNote: z.string().optional(),
  receivedDate: z.string().optional(),
  receivedBy: z.string().optional(),
  appointmentDate: z.string().optional(),
  completedDate: z.string().optional(),
  technician: z.string().nullable().optional(),
  images: z.array(z.string()).optional()
});

export const listRepairTicketsQuerySchema = z.object({
  page: z.string().transform((v) => (v ? Number(v) : undefined)).optional(),
  limit: z.string().transform((v) => (v ? Number(v) : undefined)).optional(),
  status: z.string().optional(),
  search: z.string().optional()
});

export const updateTicketStatusByTechSchema = z.object({
  status: statusEnum,
  internalNote: z.string().optional()
});
