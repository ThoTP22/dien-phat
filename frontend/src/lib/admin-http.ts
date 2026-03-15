import axios from "axios";
import { getAdminTokenCookie } from "@/lib/auth-cookie";

export const adminHttp = axios.create({
  // dùng absolute endpoints trong api.ts nên không cần baseURL ở đây
  withCredentials: true,
});

adminHttp.interceptors.request.use((config) => {
  const token = getAdminTokenCookie();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

