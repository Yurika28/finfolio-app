import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api/* requests through Next.js to the backend.
  // The browser calls localhost:3000/api/stocks (same origin → no CORS).
  // Next.js forwards server-side to Railway. Works in both dev and production.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "g.foolcdn.com",
      },
      {
        protocol: "https",
        hostname: "s3.cointelegraph.com",
      },
      {
        protocol: "https",
        hostname: "static2.finnhub.io",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
    ],
  },
};

export default nextConfig;
