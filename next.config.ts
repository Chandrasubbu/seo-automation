import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/content-analysis',
        destination: '/content-audit',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
