import axios from "axios";
import { getKtvTokenCookie } from "@/lib/ktv-cookie";

export const ktvHttp = axios.create({ withCredentials: true });

ktvHttp.interceptors.request.use((config) => {
  const token = getKtvTokenCookie();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});
