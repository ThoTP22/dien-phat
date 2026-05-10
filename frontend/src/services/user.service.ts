import { adminHttp } from "@/lib/admin-http";
import { apiEndpoints } from "@/lib/api";

export type UserRole = "admin" | "content_staff" | "technician";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  content_staff: "Nhân viên nội dung",
  technician: "Kỹ thuật viên"
};

export interface AdminUserDetail {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  fullName?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export async function fetchAdminUsers(params?: { role?: string; isActive?: boolean }): Promise<AdminUserDetail[]> {
  const urlObj = new URL(apiEndpoints.users.adminList);
  if (params?.role) urlObj.searchParams.set("role", params.role);
  if (params?.isActive !== undefined) urlObj.searchParams.set("isActive", String(params.isActive));
  const res = await adminHttp.get(urlObj.toString());
  if (!res.data?.success) throw new Error(res.data?.message || "Lỗi hệ thống");
  return res.data.data as AdminUserDetail[];
}

export async function fetchAdminUserById(id: string): Promise<AdminUserDetail> {
  const res = await adminHttp.get(apiEndpoints.users.adminDetail(id));
  if (!res.data?.success) throw new Error(res.data?.message || "Lỗi hệ thống");
  return res.data.data as AdminUserDetail;
}

export async function createAdminUser(payload: CreateUserPayload): Promise<AdminUserDetail> {
  const res = await adminHttp.post(apiEndpoints.users.adminCreate, payload);
  if (!res.data?.success) throw new Error(res.data?.message || "Lỗi hệ thống");
  return res.data.data as AdminUserDetail;
}

export async function updateAdminUser(id: string, payload: UpdateUserPayload): Promise<AdminUserDetail> {
  const res = await adminHttp.patch(apiEndpoints.users.adminUpdate(id), payload);
  if (!res.data?.success) throw new Error(res.data?.message || "Lỗi hệ thống");
  return res.data.data as AdminUserDetail;
}
