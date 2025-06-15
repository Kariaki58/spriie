import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Only for temporary use!
  },
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Only for temporary use!
  }
};

export default nextConfig;
