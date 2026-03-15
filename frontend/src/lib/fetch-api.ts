const DEFAULT_TIMEOUT_MS = 15000;
const SERVER_SIDE_TIMEOUT_MS = 30000;

export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = typeof window === "undefined" ? SERVER_SIDE_TIMEOUT_MS : DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}
