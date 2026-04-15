import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("./package.json") as { version: string };

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
