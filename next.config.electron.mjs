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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app',
  },
  experimental: {
    optimizePackageImports: ['react-icons'],
    esmExternals: 'loose',
  },
  swcMinify: true,
  // Ignore Capacitor native plugin during Electron builds (only available at runtime on device)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'capacitor-dine-printer': false,
    };
    return config;
  },
};

export default nextConfig;
