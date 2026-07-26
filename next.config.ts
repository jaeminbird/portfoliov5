import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable modern image formats and optimization.
  // deviceSizes/imageSizes are intentionally omitted — the previous values
  // restated Next's defaults exactly. `compress: true` was likewise the
  // default, and is ignored on Vercel, which compresses at the edge.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    qualities: [75, 85],
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'three'],
  },
};

export default nextConfig;
