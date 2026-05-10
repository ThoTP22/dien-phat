import mongoose, { Schema, Document } from "mongoose";

export interface TicketLogDocument extends Document {
  ticketId: mongoose.Types.ObjectId;
  ticketNumber: string;
  action: string;
  userId?: string;
  userName?: string;
  metadata?: { statusSlug?: string; images?: string[] };
  createdAt: Date;
}

const ticketLogSchema = new Schema<TicketLogDocument>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: "RepairTicket", required: true, index: true },
    ticketNumber: { type: String, required: true },
    action: { type: String, required: true },
    userId: { type: String },
    userName: { type: String },
    metadata: {
      type: {
        statusSlug: { type: String },
        images: [{ type: String }],
      },
      default: undefined,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TicketLogModel = mongoose.model<TicketLogDocument>("TicketLog", ticketLogSchema);
