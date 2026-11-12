import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // everify.localhost is used for the verification portal in local dev
  allowedDevOrigins: ["everify.localhost"],
  experimental: {
    // Vercel functions accept request bodies up to ~4.5 MB
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
