import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const origin = process.env.PALITO_API_ORIGIN;
    if (!origin) return [];
    const url = new URL(origin);
    if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol) || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) throw new Error('Invalid PALITO_API_ORIGIN');
    return [{ source: '/api/v1/:path*', destination: `${origin}/api/v1/:path*` }];
  },
  transpilePackages: ['@palito/shared'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
