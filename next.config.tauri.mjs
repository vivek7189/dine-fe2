/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  compress: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dine-backend-lake.vercel.app',
  },
  experimental: {
    optimizePackageImports: ['react-icons'],
    esmExternals: 'loose',
  },
  swcMinify: true,
};

export default nextConfig;
