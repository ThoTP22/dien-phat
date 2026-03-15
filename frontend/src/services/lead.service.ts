import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export type LeadIntent = "consultation" | "survey" | "installation" | "general";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "spam";

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  intent?: LeadIntent;
  message?: string;
  sourcePage?: string;
  status: LeadStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLeads {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeadPayload {
  fullName: string;
  phone: string;
  email?: string;
  intent?: LeadIntent;
  message?: string;
  sourcePage?: string;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
  note?: string;
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  const res = await fetch(apiEndpoints.leads.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gửi yêu cầu tư vấn thất bại");
  }

  return json.data as Lead;
}

export async function fetchAdminLeads(
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    intent?: string;
  }
): Promise<PaginatedLeads> {
  const url = new URL(apiEndpoints.leads.adminList);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const res = await adminHttp.get(url.toString());
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải danh sách leads");
  }
  return res.data.data as PaginatedLeads;
}

export async function fetchAdminLeadDetail(id: string): Promise<Lead> {
  const res = await adminHttp.get(apiEndpoints.leads.adminDetail(id));
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải lead");
  }
  return res.data.data as Lead;
}

export async function updateAdminLeadStatus(
  id: string,
  payload: UpdateLeadStatusPayload
): Promise<Lead> {
  const res = await adminHttp.patch(apiEndpoints.leads.adminUpdateStatus(id), payload);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Cập nhật lead thất bại");
  }
  return res.data.data as Lead;
}

