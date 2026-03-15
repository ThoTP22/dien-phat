"use client";

import Cookies from "js-cookie";

export const ADMIN_TOKEN_KEY = "admin_token";

export function getAdminTokenCookie(): string | null {
  return Cookies.get(ADMIN_TOKEN_KEY) ?? null;
}

export function setAdminTokenCookie(token: string): void {
  Cookies.set(ADMIN_TOKEN_KEY, token, {
    sameSite: "lax",
    expires: 7,
    path: "/",
  });
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  } catch {
    // ignore
  }
}

export function clearAdminTokenCookie(): void {
  Cookies.remove(ADMIN_TOKEN_KEY, { path: "/" });
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

