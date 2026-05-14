export const SITE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mideadienphat.shop";
  return raw.startsWith("http") ? raw : `https://${raw}`;
})();

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
