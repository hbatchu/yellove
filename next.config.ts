import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Team/player images are proxied through /api/img/[imageId]
  // No external image hostnames needed
  images: {},
};

export default nextConfig;
