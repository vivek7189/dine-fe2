import fs from 'fs';
import path from 'path';
import { blogPostContent } from './blog/blogData';

// Read static blog slugs straight from the filesystem so the sitemap never
// drifts from the actual posts in public/blog/ and public/hi/blog/.
function htmlSlugs(dir) {
  try {
    return fs.readdirSync(path.join(process.cwd(), dir))
      .filter((f) => f.endsWith('.html'))
      .map((f) => f.replace(/\.html$/, ''))
      .sort();
  } catch {
    return [];
  }
}

function subdirs(dir) {
  try {
    return fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

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
      url: `${baseUrl}/vs/dineopen-vs-toast`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vs/dineopen-vs-square`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vs/dineopen-vs-clover`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vs/dineopen-vs-lightspeed`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vs/dineopen-vs-touchbistro`,
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
      url: `${baseUrl}/best-restaurant-pos-usa-2026`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
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
  // Tool pages — every calculator/generator under src/app/tools (no drift).
  const toolPages = subdirs('src/app/tools').map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Product pages — hub pages only, no sub-pages (12)
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
    'integrations',
    'whatsapp',
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
    {
      url: `${baseUrl}/vs/toast-vs-square-vs-lightspeed`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];

  // Alternative pages — every competitor page under src/app/alternatives (no drift).
  const alternativePages = subdirs('src/app/alternatives').map((slug) => ({
    url: `${baseUrl}/alternatives/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Country pages — 6 international markets (6)
  const countryPages = [
    'usa',
    'uk',
    'uae',
    'australia',
    'canada',
    'singapore',
  ].map((slug) => ({
    url: `${baseUrl}/pos/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Country marketing hubs — anchor the US/UK/Canada clusters
  const countryHubPages = ['usa', 'uk', 'canada'].map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.95,
  }));

  // Location sub-hubs — US states, UK cities, Canada provinces (filesystem-derived)
  const locationHubPages = [
    ...subdirs('src/app/usa').map((x) => `/usa/${x}`),
    ...subdirs('src/app/uk').map((x) => `/uk/${x}`),
    ...subdirs('src/app/canada').map((x) => `/canada/${x}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
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

  // Blog posts served by Next.js dynamic route (blogData.js — have content in blogPostContent) (28)
  // Dynamic blog posts — derived from blogData content map (no drift).
  const blogPostsDynamic = Object.keys(blogPostContent).map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Blog posts served as static HTML from public/blog/ — read from the
  // filesystem so newly-added posts are always included (no manual drift).
  const blogPostsHTML = htmlSlugs('public/blog').map((slug) => ({
    url: `${baseUrl}/blog/${slug}.html`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Hindi static blog posts — read from the filesystem (all posts, no drift).
  const hindiBlogPosts = htmlSlugs('public/hi/blog').map((slug) => ({
    url: `${baseUrl}/hi/blog/${slug}.html`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  // TOTAL: ~171 pages (72 non-blog + 27 dynamic blogs + 69 static HTML blogs + 3 Hindi blogs)
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
    ...countryPages,
    ...countryHubPages,
    ...locationHubPages,
    ...cityPages,
    ...integrationPages,
    ...industryPages,
    ...toolPages,
    ...productPages,
    ...blogPostsDynamic,
    ...blogPostsHTML,
    ...hindiBlogPosts,
  ];
}
