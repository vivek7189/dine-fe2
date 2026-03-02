/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress static assets for better performance
  compress: true,
  // Optimize package imports for better bundle size
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  // Enable static optimization
  swcMinify: true,
  // Redirects to fix GSC 404 errors
  async redirects() {
    return [
      {
        source: '/products/table-management',
        destination: '/features/table-reservation',
        permanent: true,
      },
      {
        source: '/api-docs',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
