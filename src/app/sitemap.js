export default function sitemap() {
  const baseUrl = 'https://www.dineopen.com';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/restaurant-pos-software-india`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/free-restaurant-billing-software`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/restaurant-billing-app`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gst-billing-software-restaurant`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vs/dineopen-vs-petpooja`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/vs/dineopen-vs-posist`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/vs/petpooja-vs-posist`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/best-restaurant-pos-india`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // India hub and state pages
  const indiaPages = [
    {
      url: `${baseUrl}/india`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    // State pages
    ...[
      'maharashtra',
      'karnataka',
      'tamil-nadu',
      'delhi-ncr',
      'gujarat',
    ].map((slug) => ({
      url: `${baseUrl}/india/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    })),
  ];

  // Industry/Use-case pages (/for/*)
  const industryPages = [
    'restaurants',
    'cafes',
    'cloud-kitchens',
    'bars-pubs',
    'bakeries',
    'food-trucks',
    'hotels',
    'indian-restaurants',
    'chinese-restaurants',
    'fine-dining',
    'pizza-shops',
    'qsr',
    // New industry pages
    'sweet-shops',
    'food-courts',
    'catering',
    'canteens',
    'dhabas',
    'ice-cream-parlors',
    'juice-bars',
    'pubs-breweries',
    // India-specific industries
    'biryani-restaurants',
    'thali-restaurants',
    'south-indian-restaurants',
    'north-indian-restaurants',
    'mithai-shops',
    'chai-tapri',
    'street-food',
    'small-business',
  ].map((slug) => ({
    url: `${baseUrl}/for/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Tool pages (/tools/*) - Free tools for SEO traffic
  const toolPages = [
    'qr-menu-generator',
    'qr-menu-maker',
    'restaurant-invoice-generator',
    'kot-system',
    'table-management',
    'loyalty-program',
    'tip-calculator',
    'restaurant-name-generator',
    'profit-margin-calculator',
    'break-even-calculator',
    'labor-cost-calculator',
    'gst-calculator',
    'food-cost-calculator',
    'menu-price-calculator',
    'roi-calculator',
    // New free tools
    'recipe-cost-calculator',
    'kitchen-conversion-calculator',
    'bill-splitter',
    'staff-calculator',
    'fssai-fee-calculator',
    'seating-capacity-calculator',
    'tip-pooling-calculator',
    'rent-calculator',
    'menu-engineering',
    'liquor-cost-calculator',
    'catering-calculator',
    'table-turnover-calculator',
    'delivery-radius-calculator',
    'swiggy-zomato-calculator',
    'emi-calculator',
    'opening-checklist',
    // AI-powered tools (free, no login)
    'menu-description-generator',
    'review-response-generator',
    'tagline-generator',
    'social-caption-generator',
    'job-description-generator',
    'complaint-response-generator',
    // New calculators & tools
    'revenue-forecast-calculator',
    'customer-lifetime-value-calculator',
    'google-review-calculator',
    'restaurant-valuation-calculator',
    'recipe-scaler',
    'startup-cost-calculator',
  ].map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Product pages - branded DineOpen products
  const productPages = [
    // DineOpen Menu
    'menu',
    'menu/qr-menu',
    'menu/digital-menu',
    'menu/management',
    'menu/themes',
    'menu/online-menu',
    // DineOpen Loyalty
    'loyalty',
    'loyalty/crm',
    'loyalty/rewards',
    'loyalty/offers',
    'loyalty/customer-app',
    'loyalty/whatsapp',
    // DineOpen Hotel
    'hotel',
    'hotel/rooms',
    'hotel/bookings',
    'hotel/front-desk',
    'hotel/room-service',
    'hotel/housekeeping',
    // DineOpen POS
    'pos',
    'pos/cloud-pos',
    'pos/takeaway',
    'pos/dine-in',
    'pos/small-restaurants',
    // DineOpen Kitchen
    'kitchen',
    'kitchen/kot',
    'kitchen/display',
    // DineOpen Orders
    'orders',
    'orders/online',
    'orders/qr-ordering',
    'orders/delivery',
    // DineOpen AI
    'ai',
    'ai/voice-ordering',
    'ai/chatbot',
    'ai/insights',
    // DineOpen Billing
    'billing',
    'billing/gst',
    'billing/invoices',
    // DineOpen Tables
    'tables',
    'tables/reservations',
    'tables/floor-plan',
    // DineOpen Inventory
    'inventory',
    'inventory/stock',
    'inventory/suppliers',
    'inventory/recipes',
    'inventory/purchase-orders',
    'inventory/ai-reorder',
    // DineOpen Admin
    'admin',
    'admin/staff',
    'admin/multi-restaurant',
    'admin/shifts',
  ].map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: slug.includes('/') ? 0.80 : 0.90,
  }));

  // Comparison & Alternative pages (high-value for SEO)
  const comparisonPages = [
    'compare',
  ].map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Alternative pages (competitor comparison - high value)
  const alternativePages = [
    'square',
    'toast',
    'petpooja',
    'zomato-base',
    'clover',
    'reelo',
    'lightspeed',
    'touchbistro',
    'posist',
  ].map((slug) => ({
    url: `${baseUrl}/alternatives/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // City/Location pages (programmatic SEO)
  const cityPages = [
    // Metro cities India
    'mumbai',
    'delhi',
    'bangalore',
    'chennai',
    'hyderabad',
    'pune',
    'kolkata',
    'ahmedabad',
    // Tier 2 cities India
    'jaipur',
    'lucknow',
    'chandigarh',
    'kochi',
    'goa',
    // New Tier 2 cities
    'surat',
    'indore',
    'nagpur',
    'coimbatore',
    // North India - Uttarakhand & UP
    'haridwar',
    'rishikesh',
    'dehradun',
    'mussoorie',
    'varanasi',
    'agra',
    'prayagraj',
    // North India - NCR & Western UP
    'noida',
    'meerut',
    'saharanpur',
    // North India - Punjab & Himachal
    'amritsar',
    'shimla',
    // International
    'usa',
    'uk',
    'uae',
    'singapore',
    'canada',
    'australia',
  ].map((slug) => ({
    url: `${baseUrl}/pos/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Integration pages
  const integrationPages = [
    'zomato',
    'swiggy',
    'razorpay',
  ].map((slug) => ({
    url: `${baseUrl}/integrations/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Core pages
  const corePages = [
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Resource pages (high traffic potential)
  const resourcePages = [
    'business-plan',
    'startup-guide',
    // Compliance guides
    'fssai-guide',
    'fssai-registration',
    'gst-restaurants',
    'gst-filing-restaurants',
    'restaurant-licenses-india',
    'shop-establishment-act',
    'fire-safety-noc',
    // Lead magnet hubs
    'guides',
    'templates',
  ].map((slug) => ({
    url: `${baseUrl}/resources/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  // Trust & Security pages
  const trustPages = [
    {
      url: `${baseUrl}/security`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Feature pages
  const featurePages = [
    'online-ordering',
    'kitchen-display-system',
    'table-reservation',
    'staff-management',
    'whatsapp-ordering',
    'delivery-management',
  ].map((slug) => ({
    url: `${baseUrl}/features/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Loyalty pages
  const loyaltyPages = [
    'restaurant-loyalty-program',
    'customer-rewards',
    'customer-retention',
    'referral-program',
    'birthday-rewards',
  ].map((slug) => ({
    url: `${baseUrl}/loyalty/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Solution pages
  const solutionPages = [
    'restaurant-chain-management',
    'franchise-pos',
    'corporate-cafeteria',
    'food-delivery-management',
    'reduce-food-waste',
    'increase-table-turnover',
    'manage-peak-hours',
    'boost-repeat-customers',
  ].map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Blog posts
  const blogPosts = [
    'why-dineopen-future-restaurant-management',
    'how-to-reduce-restaurant-operating-costs',
    'ultimate-guide-restaurant-inventory-management',
    'why-qr-code-menus-are-essential-in-2024',
    'ai-powered-restaurant-management-guide',
    'best-practices-restaurant-staff-management',
    'how-to-increase-restaurant-revenue',
    'restaurant-technology-trends-2024',
    'best-restaurant-pos-systems-india-comparison-2024',
    'ai-voice-ordering-restaurants-2026',
    'zero-transaction-fees-restaurant-pos',
    'cloud-kitchen-guide-2026',
    'restaurant-metrics-not-tracking',
    'how-to-open-restaurant-india-2026',
    'restaurant-pos-vs-billing-software',
    // New blog posts (March 2026)
    'best-pos-system-ice-cream-shop-2026',
    'petpooja-review-2026',
    'restaurant-billing-app-complete-guide',
    // Previously missing blog posts
    'best-restaurant-pos-systems-2025-global-comparison',
    'major-pos-systems-quick-comparison',
    'complete-cafe-coffee-shop-pos-system-guide',
    'how-restaurants-attract-new-customers-2026',
    'ice-cream-dessert-shop-pos-software-complete-guide',
    '10-quick-tricks-attract-more-customers-restaurant',
    'bar-brewery-pos-software-complete-guide-2026',
    'ice-cream-parlour-pos-software-dineopen',
    'thank-you-restaurant-heroes-2025',
    'bakery-pos-software-dineopen-increase-revenue',
    'how-to-create-online-menu-restaurant',
    'beer-bar-inventory-management-complete-guide',
    '5-ways-increase-restaurant-sales-digital-menus',
    'restaurant-inventory-management-best-practices-2025',
    'qr-code-menu-benefits-restaurants',
    'complete-restaurant-management-software-guide-2025',
    'restaurant-heroes-celebrating-people-making-food-accessible',
    'increase-footfall-2026',
    'menu-pricing-management',
    'restaurant-efficiency-digital-tools',
    'best-restaurant-software-india-2025',
    'best-pos-system-pizza-restaurant',
    'restaurant-inventory-sheet',
    'restaurant-cost-management-profit',
    'lpg-gas-crisis-restaurants-india-2026',
    // New blog posts (March 2026)
    'how-to-start-sweet-shop-india',
    'how-to-start-dhaba-business-india',
    'how-to-start-food-truck-india',
    'fssai-license-restaurant-complete-guide',
    'gst-on-restaurant-india-guide',
    'how-to-register-restaurant-zomato-swiggy',
    'how-to-start-tiffin-service-india',
    'how-to-start-catering-business-india',
    'how-to-start-qsr-india',
    'restaurant-marketing-ideas-india',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Hindi tool pages
  const hindiToolPages = [
    {
      url: `${baseUrl}/hi/tools/food-cost-calculator`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Hindi blog pages
  const hindiBlogPages = [
    {
      url: `${baseUrl}/hi/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    ...[
      'restaurant-billing-software-guide-2026',
      'restaurant-kaise-khole-2026',
      'food-cost-kaise-kam-kare',
      'pos-system-kya-hai',
      'restaurant-gst-billing-software',
      'menu-card-kaise-banaye',
      'restaurant-inventory-management-hindi',
      'online-order-kaise-le',
      'restaurant-profit-kaise-badhaye',
      'qr-menu-kaise-banaye-free',
      'lpg-gas-shortage-restaurant-crisis-2026',
      // New Hindi blog posts (March 2026)
      'mithai-dukan-kaise-khole',
      'dhaba-business-kaise-shuru-kare',
      'food-truck-business-kaise-shuru-kare',
      'fssai-license-kaise-banaye',
      'restaurant-gst-guide-hindi',
      'zomato-swiggy-par-restaurant-kaise-register-kare',
      'tiffin-service-kaise-shuru-kare',
      'catering-business-kaise-shuru-kare',
      'qsr-kaise-khole',
      'restaurant-marketing-ideas-hindi',
    ].map((slug) => ({
      url: `${baseUrl}/hi/blog/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ];

  return [
    ...staticPages,
    ...indiaPages,
    ...corePages,
    ...resourcePages,
    ...trustPages,
    ...featurePages,
    ...loyaltyPages,
    ...solutionPages,
    ...comparisonPages,
    ...alternativePages,
    ...cityPages,
    ...integrationPages,
    ...industryPages,
    ...toolPages,
    ...productPages,
    ...blogPosts,
    ...hindiBlogPages,
    ...hindiToolPages
  ];
}
