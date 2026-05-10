import mongoose, { Schema, Document } from "mongoose";

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

export interface RepairTicketDocument extends Document {
  ticketNumber: string;
  ticketRefNumber?: string;
  status: RepairTicketStatus;
  serviceType: ServiceType;
  serviceLocation: ServiceLocation;
  isUrgent: boolean;

  // Thông tin sản phẩm
  productName?: string;
  manufacturer?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePlace?: string;
  faultDescription: string;
  accessories?: string;

  // Thông tin khách hàng
  customerName: string;
  customerPhone: string;
  customerAddress?: string;

  // Thông tin phiếu
  area?: string;
  quotedPrice?: number;
  note?: string;
  internalNote?: string;

  // Tiếp nhận
  receivedDate: Date;
  receivedBy?: string;
  appointmentDate?: Date;
  completedDate?: Date;
  technician?: mongoose.Types.ObjectId;
  outsourcedTo?: string;    // Tên thợ ngoài (nếu giao ra ngoài)

  // Ảnh theo giai đoạn
  intakeImages: string[];      // Ảnh tiếp nhận
  faultImages: string[];       // Ảnh hư hỏng / báo giá
  completedImages: string[];   // Ảnh sửa xong
  statusImages?: Map<string, string[]>; // Ảnh upload bởi KTV theo từng trạng thái

  createdAt: Date;
  updatedAt: Date;
}

const repairTicketSchema = new Schema<RepairTicketDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    ticketRefNumber: { type: String },
    status: {
      type: String,
      enum: [
        "new", "assigned", "quoted", "pending_confirm",
        "waiting_parts", "parts_ready", "customer_rejected",
        "returned", "repaired", "delivered", "cancelled", "outsourced"
      ],
      default: "new",
      index: true
    },
    serviceType: {
      type: String,
      enum: ["warranty", "warranty_repair", "service"],
      default: "warranty"
    },
    serviceLocation: {
      type: String,
      enum: ["at_station", "at_home"],
      default: "at_station"
    },
    isUrgent: { type: Boolean, default: false },

    productName: { type: String },
    manufacturer: { type: String },
    modelName: { type: String },
    serialNumber: { type: String, index: true },
    purchaseDate: { type: Date },
    purchasePlace: { type: String },
    faultDescription: { type: String, required: true },
    accessories: { type: String },

    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true, index: true },
    customerAddress: { type: String },

    area: { type: String },
    quotedPrice: { type: Number },
    note: { type: String },
    internalNote: { type: String },

    receivedDate: { type: Date, default: Date.now },
    receivedBy: { type: String },
    appointmentDate: { type: Date },
    completedDate: { type: Date },
    technician: { type: Schema.Types.ObjectId, ref: "User" },
    outsourcedTo: { type: String },

    intakeImages: [{ type: String }],
    faultImages: [{ type: String }],
    completedImages: [{ type: String }],
    statusImages: { type: Map, of: [{ type: String }], default: {} }
  },
  { timestamps: true }
);

repairTicketSchema.index({ createdAt: -1 });
repairTicketSchema.index({ customerPhone: 1, createdAt: -1 });

export const RepairTicketModel = mongoose.model<RepairTicketDocument>("RepairTicket", repairTicketSchema);
