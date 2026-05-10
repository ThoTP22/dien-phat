import { TicketLogModel } from "../models/TicketLog";

export async function createTicketLog(data: {
  ticketId: string;
  ticketNumber: string;
  action: string;
  userId?: string;
  userName?: string;
  metadata?: { statusSlug?: string; images?: string[] };
}): Promise<void> {
  await TicketLogModel.create(data);
}

export async function findTicketLogs(ticketId: string) {
  return TicketLogModel.find({ ticketId }).sort({ createdAt: -1 }).lean();
}
