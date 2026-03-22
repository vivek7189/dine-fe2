import { notFound } from 'next/navigation';
import { hindiBlogPosts, hindiBlogPostContent } from '../blogData';
import HindiBlogClient from './HindiBlogClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  // Exclude isStatic posts — they're served as raw HTML via beforeFiles rewrites
  // Including them here would pre-render 404 pages that override the rewrites
  return hindiBlogPosts.filter(post => !post.isStatic).map((post) => ({
    slug: post.slug,
  }));
}

const hindiToEnglishMap = {
  'restaurant-billing-software-guide-2026': 'restaurant-billing-app-complete-guide',
  'restaurant-kaise-khole-2026': 'how-to-open-restaurant-india-2026',
  'food-cost-kaise-kam-kare': 'how-to-reduce-restaurant-operating-costs',
  'pos-system-kya-hai': 'restaurant-pos-vs-billing-software',
  'menu-card-kaise-banaye': 'how-to-create-online-menu-restaurant',
  'restaurant-inventory-management-hindi': 'ultimate-guide-restaurant-inventory-management',
  'restaurant-profit-kaise-badhaye': 'how-to-increase-restaurant-revenue',
  'qr-menu-kaise-banaye-free': 'why-qr-code-menus-are-essential-in-2024',
  'lpg-gas-shortage-restaurant-crisis-2026': 'lpg-gas-crisis-restaurants-india-2026',
  'mithai-dukan-kaise-khole': 'how-to-start-sweet-shop-india',
  'dhaba-business-kaise-shuru-kare': 'how-to-start-dhaba-business-india',
  'food-truck-business-kaise-shuru-kare': 'how-to-start-food-truck-india',
  'fssai-license-kaise-banaye': 'fssai-license-restaurant-complete-guide',
  'restaurant-gst-guide-hindi': 'gst-on-restaurant-india-guide',
  'zomato-swiggy-par-restaurant-kaise-register-kare': 'how-to-register-restaurant-zomato-swiggy',
  'tiffin-service-kaise-shuru-kare': 'how-to-start-tiffin-service-india',
  'catering-business-kaise-shuru-kare': 'how-to-start-catering-business-india',
  'qsr-kaise-khole': 'how-to-start-qsr-india',
  'restaurant-marketing-ideas-hindi': 'restaurant-marketing-ideas-india',
  'ice-cream-parlour-ke-liye-best-pos': 'best-pos-system-ice-cream-shop',
  'ice-cream-parlour-kaise-khole': 'how-to-start-ice-cream-parlour-india',
  'ice-cream-dukan-inventory-management': 'ice-cream-shop-inventory-management',
  'petpooja-alternative-hindi': 'petpooja-alternative-2026',
  'best-restaurant-pos-india-hindi': 'best-pos-system-restaurant-india',
  'free-qr-menu-kaise-banaye': 'free-qr-menu-maker-guide',
  'restaurant-loyalty-program-hindi': 'restaurant-loyalty-program-guide',
  'restaurant-technology-trends-hindi-2026': 'restaurant-technology-trends-2026',
  'chocolate-shop-pos-software-hindi': 'chocolate-shop-pos-software-india',
  'restaurant-automation-software-hindi': 'restaurant-automation-software-guide',
  // Content gap blogs
  'cafe-coffee-shop-kaise-khole': 'how-to-start-cafe-coffee-shop-india',
  'juice-bar-kaise-khole': 'how-to-start-juice-bar-india',
  'chai-tapri-business-kaise-shuru-kare': 'how-to-start-chai-tapri-business',
  'bakery-kaise-khole': 'how-to-start-bakery-india',
  'cloud-kitchen-ya-restaurant-kya-behtar': 'cloud-kitchen-vs-restaurant-india',
  'dineopen-vs-posist-comparison-hindi': 'dineopen-vs-posist-detailed-comparison',
  'swiggy-zomato-commission-kaise-bachaye': 'swiggy-zomato-commission-calculator-guide',
  'chhote-restaurant-ke-liye-billing-software': 'best-billing-software-small-restaurant',
  'food-cost-percentage-kaise-nikale': 'how-to-calculate-food-cost-percentage',
  'restaurant-break-even-kaise-calculate-kare': 'restaurant-break-even-analysis-guide',
  'qr-menu-future-trend-hindi-2026': 'qr-code-menus-future-trend-2026',
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = hindiBlogPostContent[slug];

  if (!post) {
    return {
      title: 'ब्लॉग नहीं मिला | DineOpen',
      description: 'यह ब्लॉग पोस्ट उपलब्ध नहीं है।',
    };
  }

  const englishSlug = hindiToEnglishMap[slug];

  return {
    title: `${post.title} | DineOpen ब्लॉग`,
    description: post.excerpt,
    keywords: post.tags?.join(', ') || '',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
      url: `https://www.dineopen.com/hi/blog/${slug}`,
      locale: 'hi_IN',
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
      canonical: `https://www.dineopen.com/hi/blog/${slug}`,
      languages: {
        'hi': `https://www.dineopen.com/hi/blog/${slug}`,
        ...(englishSlug ? { 'en': `https://www.dineopen.com/blog/${englishSlug}` } : {}),
      },
    },
  };
}

export default async function HindiBlogDetailPage({ params }) {
  const { slug } = await params;
  const post = hindiBlogPostContent[slug];

  if (!post) {
    notFound();
  }

  // BlogPosting structured data
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "inLanguage": "hi",
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
      "@id": `https://www.dineopen.com/hi/blog/${slug}`
    }
  };

  // FAQ structured data
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.dineopen.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "हिंदी ब्लॉग",
        "item": "https://www.dineopen.com/hi/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://www.dineopen.com/hi/blog/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <HindiBlogClient blogPost={post} />
      </div>
    </>
  );
}
