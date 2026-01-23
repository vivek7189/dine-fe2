/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com', 'storage.googleapis.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  },
  // Ensure proper handling of client-side features
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
