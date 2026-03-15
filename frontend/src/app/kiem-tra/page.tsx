import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm tra kết nối API",
  robots: "noindex, nofollow"
};

export const dynamic = "force-dynamic";

function getServerApiBase(): string {
  const u = process.env.API_SERVER_URL;
  if (u?.startsWith("http")) return u;
  const pub = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  if (pub.startsWith("http")) return pub;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return site.replace(/\/$/, "") + (pub.startsWith("/") ? pub : "/" + pub);
}

async function getApiStatus() {
  const apiBase = getServerApiBase();
  const baseNoApi = apiBase.replace(/\/api\/?$/, "");
  const pingUrl = baseNoApi + "/api/ping";
  const healthUrl = baseNoApi + "/api/health";
  const productsUrl = apiBase + "/v1/products";

  const results: Record<string, { ok: boolean; status?: number; error?: string; duration?: number }> = {};

  for (const [name, url] of [
    ["ping", pingUrl],
    ["health", healthUrl],
    ["products", productsUrl]
  ] as const) {
    const start = Date.now();
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(25000) });
      const duration = Date.now() - start;
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      results[name] = {
        ok: res.ok,
        status: res.status,
        duration,
        error: res.ok ? undefined : JSON.stringify(body)
      };
    } catch (e) {
      results[name] = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        duration: Date.now() - start
      };
    }
  }

  return {
    apiBase: apiBase.replace(/\/v1\/products$/, ""),
    env: {
      API_SERVER_URL: process.env.API_SERVER_URL ? "[SET]" : "[MISSING]",
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "[MISSING]",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "[MISSING]"
    },
    results
  };
}

export default async function KiemTraPage() {
  const data = await getApiStatus();
  const allOk = Object.values(data.results).every((r) => r.ok);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-xl font-semibold">Kiểm tra kết nối API</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <p className="mb-2 font-medium">API Base: {data.apiBase}</p>
        <div className="space-y-1 text-zinc-600">
          <p>API_SERVER_URL: {data.env.API_SERVER_URL}</p>
          <p>NEXT_PUBLIC_API_BASE_URL: {data.env.NEXT_PUBLIC_API_BASE_URL}</p>
          <p>NEXT_PUBLIC_SITE_URL: {data.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(data.results).map(([name, r]) => (
          <div
            key={name}
            className={`rounded-lg border p-4 ${r.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <p className="font-medium">
              {name}: {r.ok ? "OK" : "Lỗi"}
              {r.duration != null && ` (${r.duration}ms)`}
            </p>
            {r.status != null && <p className="text-xs">HTTP {r.status}</p>}
            {r.error && <p className="mt-1 text-xs text-red-700">{r.error}</p>}
          </div>
        ))}
      </div>
      <p className={allOk ? "text-green-700" : "text-red-700"}>
        {allOk ? "Tất cả kiểm tra thành công." : "Có lỗi. Kiểm tra Environment Variables trên Vercel và backend."}
      </p>
    </div>
  );
}
