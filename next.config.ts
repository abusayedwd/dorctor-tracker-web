import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /*
   * The browser talks to `/api/*` on the frontend origin and Next proxies it to
   * the standalone Express API. The httpOnly refresh cookie therefore becomes a
   * first-party cookie (no third-party cookie / SameSite=None issues), and the
   * Next middleware can see it to protect routes before rendering.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
