import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/uploads/:filename',
        destination: '/api/files/:filename',
      },
    ];
  },
};

export default nextConfig;
