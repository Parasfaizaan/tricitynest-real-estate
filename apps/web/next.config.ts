import type { NextConfig } from "next";

function optionalHostname(value?: string) {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const s3PublicHost = optionalHostname(process.env.AWS_S3_PUBLIC_BASE_URL);

const nextConfig: NextConfig = {
  transpilePackages: ["@tricitynest/ui"],
  allowedDevOrigins: ["*.monkeycode-ai.live"],
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 25,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      ...(s3PublicHost ? [{ protocol: "https" as const, hostname: s3PublicHost }] : []),
    ],
  },
};

export default nextConfig;
