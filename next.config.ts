import type { NextConfig } from "next";
import { baseHeaders, contentSecurityPolicy } from "./lib/security-headers";

const production = process.env.NODE_ENV === "production";

/**
 * Used by `next build` (Vercel). On Cloudflare the same headers come from
 * worker/index.ts and public/_headers.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const security = Object.entries(baseHeaders).map(([key, value]) => ({ key, value }));
    if (production) {
      security.push(
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      );
    }
    return [
      { source: "/:path*", headers: security },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
