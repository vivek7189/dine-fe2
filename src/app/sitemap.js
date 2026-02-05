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
  ].map((slug) => ({
    url: `${baseUrl}/for/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Tool pages (/tools/*) - Free tools for SEO traffic
  const toolPages = [
    'qr-menu-generator',
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
  ].map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Product pages
  const productPages = [
    'ai-agent',
    'restaurant-management',
    'pos-software',
    'hotel-management',
    'inventory-management',
    'supply-management',
    'billing-software',
  ].map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
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
  ].map((slug) => ({
    url: `${baseUrl}/alternatives/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // City/Location pages (programmatic SEO)
  const cityPages = [
    'mumbai',
    'delhi',
    'bangalore',
    'usa',
    'uk',
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
  ];

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
    'best-restaurant-pos-systems-india-comparison-2024'
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...corePages,
    ...comparisonPages,
    ...alternativePages,
    ...cityPages,
    ...integrationPages,
    ...industryPages,
    ...toolPages,
    ...productPages,
    ...blogPosts
  ];
}
