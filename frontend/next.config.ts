import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercel: không dùng standalone. AWS/Docker: bật lại output: "standalone"
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
