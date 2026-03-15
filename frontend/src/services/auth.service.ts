import { apiEndpoints } from "@/lib/api";
import { setAdminTokenCookie, clearAdminTokenCookie } from "@/lib/auth-cookie";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(apiEndpoints.auth.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    credentials: "include"
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Đăng nhập thất bại");
  }

  const data = json.data as LoginResponse;
  setAdminTokenCookie(data.accessToken);
  return data;
}

export async function getCurrentUser(token: string): Promise<AuthUser | null> {
  const res = await fetch(apiEndpoints.auth.me, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    credentials: "include"
  });

  if (res.status === 401) {
    return null;
  }

  const json = await res.json();

  if (!json.success) {
    return null;
  }

  return json.data.user as AuthUser;
}

export async function logout(token: string): Promise<void> {
  const res = await fetch(apiEndpoints.auth.logout, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    credentials: "include"
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || "Đăng xuất thất bại");
  }

  clearAdminTokenCookie();
}

