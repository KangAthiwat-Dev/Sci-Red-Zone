import type { NextConfig } from "next";

const GAME_ASSET_CACHE =
  "public, max-age=3600, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // ========================================
      // 3D Models
      // ========================================

      {
        source: "/player/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: GAME_ASSET_CACHE,
          },
        ],
      },

      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: GAME_ASSET_CACHE,
          },
        ],
      },

      // ========================================
      // Maps
      // ========================================

      {
        source: "/maps/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: GAME_ASSET_CACHE,
          },
        ],
      },

      // ========================================
      // Audio
      // ========================================

      {
        source: "/sounds/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: GAME_ASSET_CACHE,
          },
        ],
      },

      // ========================================
      // Videos
      // ========================================

      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: GAME_ASSET_CACHE,
          },
        ],
      },

      // ========================================
      // Scene Decorations
      // ========================================

      {
        source: "/decorations/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: GAME_ASSET_CACHE,
          },
        ],
      },
    ];
  },
};

export default nextConfig;