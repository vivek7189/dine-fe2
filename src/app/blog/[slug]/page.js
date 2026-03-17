import { notFound } from 'next/navigation';
import { blogPosts, blogPostContent } from '../blogData';
import BlogClient from './BlogClient';

// Force static generation
export const dynamic = 'force-static';
export const dynamicParams = false; // Return 404 for unknown slugs

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  // Exclude isStatic posts — they're served as raw HTML via beforeFiles rewrites
  // Including them here would pre-render 404 pages that override the rewrites
  return blogPosts.filter(post => !post.isStatic).map((post) => ({
    slug: post.slug,
  }));
}

// Hindi equivalents for hreflang
const englishToHindiMap = {
  'restaurant-billing-app-complete-guide': 'restaurant-billing-software-guide-2026',
  'how-to-open-restaurant-india-2026': 'restaurant-kaise-khole-2026',
  'how-to-reduce-restaurant-operating-costs': 'food-cost-kaise-kam-kare',
  'restaurant-pos-vs-billing-software': 'pos-system-kya-hai',
  'how-to-create-online-menu-restaurant': 'menu-card-kaise-banaye',
  'ultimate-guide-restaurant-inventory-management': 'restaurant-inventory-management-hindi',
  'how-to-increase-restaurant-revenue': 'restaurant-profit-kaise-badhaye',
  'why-qr-code-menus-are-essential-in-2024': 'qr-menu-kaise-banaye-free',
  'lpg-gas-crisis-restaurants-india-2026': 'lpg-gas-shortage-restaurant-crisis-2026',
  'how-to-start-sweet-shop-india': 'mithai-dukan-kaise-khole',
  'how-to-start-dhaba-business-india': 'dhaba-business-kaise-shuru-kare',
  'how-to-start-food-truck-india': 'food-truck-business-kaise-shuru-kare',
  'fssai-license-restaurant-complete-guide': 'fssai-license-kaise-banaye',
  'gst-on-restaurant-india-guide': 'restaurant-gst-guide-hindi',
  'how-to-register-restaurant-zomato-swiggy': 'zomato-swiggy-par-restaurant-kaise-register-kare',
  'how-to-start-tiffin-service-india': 'tiffin-service-kaise-shuru-kare',
  'how-to-start-catering-business-india': 'catering-business-kaise-shuru-kare',
  'how-to-start-qsr-india': 'qsr-kaise-khole',
  'restaurant-marketing-ideas-india': 'restaurant-marketing-ideas-hindi',
  'best-pos-system-ice-cream-shop': 'ice-cream-parlour-ke-liye-best-pos',
  'how-to-start-ice-cream-parlour-india': 'ice-cream-parlour-kaise-khole',
  'ice-cream-shop-inventory-management': 'ice-cream-dukan-inventory-management',
  'petpooja-alternative-2026': 'petpooja-alternative-hindi',
  'best-pos-system-restaurant-india': 'best-restaurant-pos-india-hindi',
  'free-qr-menu-maker-guide': 'free-qr-menu-kaise-banaye',
  'restaurant-loyalty-program-guide': 'restaurant-loyalty-program-hindi',
  'restaurant-technology-trends-2026': 'restaurant-technology-trends-hindi-2026',
  'chocolate-shop-pos-software-india': 'chocolate-shop-pos-software-hindi',
  'restaurant-automation-software-guide': 'restaurant-automation-software-hindi',
  // Content gap blogs
  'how-to-start-cafe-coffee-shop-india': 'cafe-coffee-shop-kaise-khole',
  'how-to-start-juice-bar-india': 'juice-bar-kaise-khole',
  'how-to-start-chai-tapri-business': 'chai-tapri-business-kaise-shuru-kare',
  'how-to-start-bakery-india': 'bakery-kaise-khole',
  'cloud-kitchen-vs-restaurant-india': 'cloud-kitchen-ya-restaurant-kya-behtar',
  'dineopen-vs-posist-detailed-comparison': 'dineopen-vs-posist-comparison-hindi',
  'swiggy-zomato-commission-calculator-guide': 'swiggy-zomato-commission-kaise-bachaye',
  'best-billing-software-small-restaurant': 'chhote-restaurant-ke-liye-billing-software',
  'how-to-calculate-food-cost-percentage': 'food-cost-percentage-kaise-nikale',
  'restaurant-break-even-analysis-guide': 'restaurant-break-even-kaise-calculate-kare',
  // High-value SEO blogs - Batch 2
  'how-to-hire-restaurant-staff-india': 'restaurant-staff-kaise-hire-kare',
  'restaurant-profit-margins-india-guide': 'restaurant-profit-margin-guide-hindi',
  'how-to-respond-negative-reviews-restaurant': 'negative-review-ka-jawab-kaise-de',
  'restaurant-kitchen-hygiene-checklist': 'restaurant-kitchen-safai-checklist',
  'cost-to-open-restaurant-india-2026': 'restaurant-kholne-ka-kharcha-2026',
  'reduce-zomato-swiggy-commission-restaurants': 'zomato-swiggy-commission-kaise-bachaye',
  'restaurant-grand-opening-marketing-plan': 'restaurant-opening-marketing-plan-hindi',
  'menu-engineering-guide-restaurants': 'menu-engineering-guide-hindi',
  'mudra-loan-restaurant-business-india': 'mudra-loan-restaurant-hindi',
  'restaurant-instagram-marketing-guide': 'restaurant-instagram-marketing-hindi',
  // Search Console keyword-targeted blogs - Batch 3
  'best-restaurant-loyalty-program-software-india': 'best-loyalty-software-restaurant-hindi',
  'best-restaurant-technology-2026': 'best-restaurant-technology-hindi-2026',
  'petpooja-alternative-free-2026': 'petpooja-free-alternative-hindi',
  'petpooja-pricing-plans-2026': 'petpooja-pricing-hindi',
  'petpooja-vs-slickpos-vs-dineopen-small-restaurant': 'petpooja-vs-slickpos-vs-dineopen-hindi',
  'best-restaurant-billing-app-india-2026': 'best-billing-app-restaurant-hindi',
  'cloud-kitchen-pos-petpooja-vs-urbanpiper-vs-dineopen': 'cloud-kitchen-pos-comparison-hindi',
};

// Generate metadata for each blog post
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPostContent[slug];

  if (!post) {
    return {
      title: 'Blog Post Not Found | DineOpen',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  const hindiSlug = englishToHindiMap[slug];

  return {
    title: `${post.title} | DineOpen Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(', ') || '',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
      url: `https://www.dineopen.com/blog/${slug}`,
      images: [
        {
          url: 'https://www.dineopen.com/favicon.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://www.dineopen.com/blog/${slug}`,
      languages: {
        'en': `https://www.dineopen.com/blog/${slug}`,
        ...(hindiSlug ? { 'hi': `https://www.dineopen.com/hi/blog/${hindiSlug}` } : {}),
      },
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = blogPostContent[slug];

  if (!post) {
    notFound();
  }

  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "DineOpen",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dineopen.com/favicon.png"
      }
    },
    "datePublished": post.publishDate,
    "dateModified": post.publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.dineopen.com/blog/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <BlogClient blogPost={post} />
      </div>
    </>
  );
}
