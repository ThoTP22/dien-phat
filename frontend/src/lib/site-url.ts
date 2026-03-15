export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dienphat-midea.vn";

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
