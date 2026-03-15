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
  // Rewrites: serve static HTML blog posts at both /blog/slug and /blog/slug.html
  // This fixes 144 broken URLs caused by internal links missing .html extension
  async rewrites() {
    const staticBlogSlugs = [
      'best-billing-software-small-restaurant',
      'best-catering-management-software-india',
      'best-free-pos-ice-cream-shop',
      'best-pos-system-ice-cream-shop',
      'best-pos-system-pizza-restaurant',
      'best-pos-system-restaurant-india',
      'best-restaurant-billing-app-india-2026',
      'best-restaurant-loyalty-program-software-india',
      'best-restaurant-pos-uae-dubai-2026',
      'best-restaurant-pos-uk-2026',
      'best-restaurant-software-india-2025',
      'best-restaurant-technology-2026',
      'chocolate-shop-pos-software-india',
      'cloud-kitchen-pos-petpooja-vs-urbanpiper-vs-dineopen',
      'cloud-kitchen-vs-restaurant-india',
      'cost-to-open-restaurant-india-2026',
      'dineopen-vs-posist-detailed-comparison',
      'food-cost-calculator-complete-guide',
      'food-waste-cost-management-cafe-restaurant',
      'free-qr-menu-maker-guide',
      'fssai-license-restaurant-complete-guide',
      'gelato-vs-ice-cream-parlour-business-guide',
      'gst-on-restaurant-india-guide',
      'how-to-calculate-food-cost-percentage',
      'how-to-hire-restaurant-staff-india',
      'how-to-register-restaurant-zomato-swiggy',
      'how-to-respond-negative-reviews-restaurant',
      'how-to-start-bakery-india',
      'how-to-start-cafe-coffee-shop-india',
      'how-to-start-catering-business-india',
      'how-to-start-chai-tapri-business',
      'how-to-start-dhaba-business-india',
      'how-to-start-food-truck-india',
      'how-to-start-ice-cream-parlour-india',
      'how-to-start-juice-bar-india',
      'how-to-start-qsr-india',
      'how-to-start-sweet-shop-india',
      'how-to-start-tiffin-service-india',
      'ice-cream-business-online-delivery-guide',
      'ice-cream-shop-inventory-management',
      'ice-cream-shop-menu-pricing-guide',
      'increase-footfall-2026',
      'kot-system-restaurant-complete-guide',
      'lpg-gas-crisis-restaurants-india-2026',
      'menu-engineering-guide-restaurants',
      'menu-pricing-management',
      'mudra-loan-restaurant-business-india',
      'petpooja-alternative-2026',
      'petpooja-alternative-free-2026',
      'petpooja-pricing-plans-2026',
      'petpooja-vs-slickpos-vs-dineopen-small-restaurant',
      'qr-code-menus-future-trend-2026',
      'reduce-zomato-swiggy-commission-restaurants',
      'restaurant-automation-software-guide',
      'restaurant-break-even-analysis-guide',
      'restaurant-cost-management-profit',
      'restaurant-efficiency-digital-tools',
      'restaurant-grand-opening-marketing-plan',
      'restaurant-instagram-marketing-guide',
      'restaurant-inventory-sheet',
      'restaurant-kitchen-hygiene-checklist',
      'restaurant-loyalty-program-guide',
      'restaurant-marketing-ideas-india',
      'restaurant-menu-pricing-formula-guide',
      'restaurant-profit-margins-india-guide',
      'restaurant-technology-trends-2024',
      'restaurant-technology-trends-2026',
      'swiggy-zomato-commission-calculator-guide',
      'what-is-restaurant-operating-system',
    ];

    return {
      // beforeFiles ensures rewrites run BEFORE Next.js checks static/SSG pages
      // Without this, the dynamic [slug] route would serve a 404 for these slugs
      beforeFiles: staticBlogSlugs.map((slug) => ({
        source: `/blog/${slug}`,
        destination: `/blog/${slug}.html`,
      })),
    };
  },
};

export default nextConfig;
