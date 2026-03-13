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
  // Block Vercel preview domain from being indexed (prevents duplicate content)
  async headers() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'dine-frontend-ecru.vercel.app',
          },
        ],
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
  // Redirects for SEO and product branding
  async redirects() {
    return [
      // Legacy product URL redirects → new branded URLs
      {
        source: '/products/pos-software',
        destination: '/products/pos',
        permanent: true,
      },
      {
        source: '/products/pos-software/:path*',
        destination: '/products/pos/:path*',
        permanent: true,
      },
      {
        source: '/products/loyalty-rewards',
        destination: '/products/loyalty',
        permanent: true,
      },
      {
        source: '/products/hotel-management',
        destination: '/products/hotel',
        permanent: true,
      },
      {
        source: '/products/inventory-management',
        destination: '/products/inventory',
        permanent: true,
      },
      {
        source: '/products/billing-software',
        destination: '/products/billing',
        permanent: true,
      },
      {
        source: '/products/ai-agent',
        destination: '/products/ai',
        permanent: true,
      },
      {
        source: '/products/restaurant-management',
        destination: '/products/admin',
        permanent: true,
      },
      {
        source: '/products/multi-restaurant',
        destination: '/products/admin/multi-restaurant',
        permanent: true,
      },
      {
        source: '/products/supply-management',
        destination: '/products/inventory/suppliers',
        permanent: true,
      },
      {
        source: '/products/waiter-app',
        destination: '/products/orders/waiter-app',
        permanent: true,
      },
      {
        source: '/products/table-management',
        destination: '/products/tables',
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
