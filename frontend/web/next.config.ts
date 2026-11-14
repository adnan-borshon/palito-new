import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@palito/shared'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
