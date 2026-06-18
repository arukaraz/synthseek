import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("./package.json") as { version: string };

const API_URL = process.env.API_URL || "http://localhost:4401";

const IMAGE_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

const nextConfig: NextConfig = {
  output: "standalone",

  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    minimumCacheTTL: IMAGE_CACHE_TTL_SECONDS,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
      },
      {
        protocol: "https",
        hostname: "e-cdns-images.dzcdn.net",
      },
      {
        protocol: "https",
        hostname: "coverartarchive.org",
      },
      {
        protocol: "https",
        hostname: "**.archive.org",
      },
      {
        protocol: "https",
        hostname: "assets.fanart.tv",
      },
      {
        protocol: "https",
        hostname: "**.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
    ],
  },

  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,
      };
    }
    return config;
  },

  async rewrites() {
    // Proxy the backend API and the OAuth Authorization Server endpoints (which
    // live at the Express root) to the backend, so a single public host serves
    // both the web UI and the API/OAuth surface.
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/.well-known/:path*", destination: `${API_URL}/.well-known/:path*` },
      { source: "/authorize", destination: `${API_URL}/authorize` },
      { source: "/token", destination: `${API_URL}/token` },
      { source: "/register", destination: `${API_URL}/register` },
      { source: "/revoke", destination: `${API_URL}/revoke` },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
