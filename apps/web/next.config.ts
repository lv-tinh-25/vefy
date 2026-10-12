import path from "node:path";
import type { NextConfig } from "next";

// The embedded API reads server secrets from the monorepo root .env (absent on Vercel)
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {}

const nextConfig: NextConfig = {
  transpilePackages: ["@vefy/shared", "@vefy/api", "@vefy/db"],
  // Browsers must always fetch the latest service worker, or push handling fixes never ship
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] }];
  },
  // Oil and parts moved under the Maintenance tab; keep old links and bookmarks working
  async redirects() {
    return ["oil", "parts"].map((tab) => ({
      source: `/vehicle/:id/${tab}`,
      destination: `/vehicle/:id/maintenance/${tab}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
