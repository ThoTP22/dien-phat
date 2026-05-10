"use client";
import Cookies from "js-cookie";

export const KTV_TOKEN_KEY = "ktv_token";

export function getKtvTokenCookie(): string | null {
  if (typeof globalThis.window === "undefined") return null;
  return Cookies.get(KTV_TOKEN_KEY) ?? localStorage.getItem(KTV_TOKEN_KEY);
}

export function setKtvTokenCookie(token: string): void {
  Cookies.set(KTV_TOKEN_KEY, token, { sameSite: "lax", expires: 7, path: "/" });
  try {
    if (typeof globalThis.window !== "undefined") localStorage.setItem(KTV_TOKEN_KEY, token);
  } catch { /* ignore */ }
}

export function clearKtvTokenCookie(): void {
  Cookies.remove(KTV_TOKEN_KEY, { path: "/" });
  try {
    if (typeof globalThis.window !== "undefined") localStorage.removeItem(KTV_TOKEN_KEY);
  } catch { /* ignore */ }
}
