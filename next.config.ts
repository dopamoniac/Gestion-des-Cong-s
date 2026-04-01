import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed "standalone" — Vercel manages its own output
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Tell Vercel to not bundle these — they use native/WASM binaries
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
