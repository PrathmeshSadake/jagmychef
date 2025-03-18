import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rue7vxma3l1fw7f7.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
