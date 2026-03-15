"use client";

import { useSyncExternalStore } from "react";
import { ADMIN_TOKEN_KEY, getAdminTokenCookie } from "./auth-cookie";

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_TOKEN_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function getSnapshot() {
  return getAdminTokenCookie();
}

function getServerSnapshot() {
  return null;
}

export function useAdminToken(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

