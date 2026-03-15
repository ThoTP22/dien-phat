import { LeadDocument } from "../../models/Lead";

export interface LeadResponseDTO {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  intent?: string;
  message?: string;
  sourcePage?: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLeadsResponseDTO {
  items: LeadResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export const toLeadResponse = (doc: LeadDocument): LeadResponseDTO => ({
  id: doc._id.toString(),
  fullName: doc.fullName,
  phone: doc.phone,
  email: doc.email,
  intent: doc.intent,
  message: doc.message,
  sourcePage: doc.sourcePage,
  status: doc.status,
  note: doc.note,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString()
});

