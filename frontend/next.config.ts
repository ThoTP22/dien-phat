import type { NextConfig } from "next";

const backendUrl = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const backendBase = backendUrl?.replace(/\/api\/?$/, "") || "http://localhost:4000";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercel: không dùng standalone. AWS/Docker: bật lại output: "standalone"
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  // Proxy /api -> backend (tránh CORS, client gọi cùng origin)
  async rewrites() {
    if (backendBase.startsWith("http")) {
      return [{ source: "/api/:path*", destination: `${backendBase}/api/:path*` }];
    }
    return [];
  },
};

export default nextConfig;
