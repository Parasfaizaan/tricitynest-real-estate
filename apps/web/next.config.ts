import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tricitynest/ui"],
  allowedDevOrigins: ["*.monkeycode-ai.live"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
