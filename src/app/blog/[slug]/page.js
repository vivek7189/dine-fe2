import { notFound } from 'next/navigation';
import { blogPosts, blogPostContent } from '../blogData';
import BlogClient from './BlogClient';

// Force static generation
export const dynamic = 'force-static';
export const dynamicParams = false; // Return 404 for unknown slugs

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
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
