import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/finance/top-up',
        destination: '/finance/top-ups',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
