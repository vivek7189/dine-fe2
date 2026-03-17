export default function sitemap() {
  const baseUrl = 'https://www.dineopen.com';
  const currentDate = new Date().toISOString();

  // Static pages (12)
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
    {
      url: `${baseUrl}/api-docs`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // India hub + top 3 state pages (4)
  const indiaPages = [
    {
      url: `${baseUrl}/india`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    ...['maharashtra', 'karnataka', 'delhi-ncr'].map((slug) => ({
      url: `${baseUrl}/india/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    })),
  ];

  // Industry pages — top 8 with impressions/clicks (8)
  const industryPages = [
    'restaurants',
    'cafes',
    'cloud-kitchens',
    'bakeries',
    'hotels',
    'qsr',
    'catering',
    'ice-cream-parlors',
  ].map((slug) => ({
    url: `${baseUrl}/for/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Tool pages — top 10 with impressions/clicks (10)
  const toolPages = [
    'food-cost-calculator',
    'kot-system',
    'bill-splitter',
    'qr-menu-generator',
    'qr-menu-maker',
    'gst-calculator',
    'tip-calculator',
    'break-even-calculator',
    'restaurant-invoice-generator',
    'swiggy-zomato-calculator',
  ].map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Product pages — hub pages only, no sub-pages (11)
  const productPages = [
    'menu',
    'loyalty',
    'hotel',
    'pos',
    'kitchen',
    'orders',
    'ai',
    'billing',
    'tables',
    'inventory',
    'admin',
  ].map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.90,
  }));

  // Comparison page (1)
  const comparisonPages = [
    {
      url: `${baseUrl}/compare`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Alternative pages — top 3 competitors (3)
  const alternativePages = ['petpooja', 'toast', 'posist'].map((slug) => ({
    url: `${baseUrl}/alternatives/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // City pages — 8 metro cities only (8)
  const cityPages = [
    'mumbai',
    'delhi',
    'bangalore',
    'chennai',
    'hyderabad',
    'pune',
    'kolkata',
    'ahmedabad',
  ].map((slug) => ({
    url: `${baseUrl}/pos/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Integration pages (3)
  const integrationPages = ['zomato', 'swiggy', 'razorpay'].map((slug) => ({
    url: `${baseUrl}/integrations/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Core pages (3)
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

  // Resource pages — top 3 (3)
  const resourcePages = ['business-plan', 'fssai-guide', 'gst-restaurants'].map(
    (slug) => ({
      url: `${baseUrl}/resources/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    })
  );

  // Trust & Security (1)
  const trustPages = [
    {
      url: `${baseUrl}/security`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Feature pages — top 2 (2)
  const featurePages = ['online-ordering', 'kitchen-display-system'].map(
    (slug) => ({
      url: `${baseUrl}/features/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  );

  // Loyalty pages — top 1 (1)
  const loyaltyPages = [
    {
      url: `${baseUrl}/loyalty/restaurant-loyalty-program`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Solution pages — top 2 (2)
  const solutionPages = ['restaurant-chain-management', 'food-delivery-management'].map(
    (slug) => ({
      url: `${baseUrl}/solutions/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  );

  // Blog posts served by Next.js dynamic route (blogData.js — have content in blogPostContent) (27)
  const blogPostsDynamic = [
    '5-ways-increase-restaurant-sales-digital-menus',
    'ai-voice-ordering-restaurants-2026',
    'bakery-pos-software-dineopen-increase-revenue',
    'bar-brewery-pos-software-complete-guide-2026',
    'beer-bar-inventory-management-complete-guide',
    'best-pos-system-ice-cream-shop-2026',
    'best-practices-restaurant-staff-management',
    'cloud-kitchen-guide-2026',
    'complete-cafe-coffee-shop-pos-system-guide',
    'complete-restaurant-management-software-guide-2025',
    'how-restaurants-attract-new-customers-2026',
    'how-to-create-online-menu-restaurant',
    'how-to-increase-restaurant-revenue',
    'how-to-open-restaurant-india-2026',
    'how-to-reduce-restaurant-operating-costs',
    'ice-cream-dessert-shop-pos-software-complete-guide',
    'ice-cream-parlour-pos-software-dineopen',
    'petpooja-review-2026',
    'qr-code-menu-benefits-restaurants',
    'restaurant-billing-app-complete-guide',
    'restaurant-heroes-celebrating-people-making-food-accessible',
    'restaurant-inventory-management-best-practices-2025',
    'restaurant-metrics-not-tracking',
    'restaurant-pos-vs-billing-software',
    'thank-you-restaurant-heroes-2025',
    'why-qr-code-menus-are-essential-in-2024',
    'zero-transaction-fees-restaurant-pos',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Blog posts served as static HTML from public/blog/ (69)
  // These have full content in .html files but their non-.html URLs are 404/empty
  // Sitemap must point to the .html URLs where the actual content lives
  const blogPostsHTML = [
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
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}.html`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // TOTAL: ~168 pages (72 non-blog + 27 dynamic blogs + 69 static HTML blogs)
  // All URLs in sitemap point to pages with REAL content
  // See SEO-AUDIT.md for full change log

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
    ...blogPostsDynamic,
    ...blogPostsHTML,
  ];
}
