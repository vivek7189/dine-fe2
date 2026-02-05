import HomePageClient from './HomePageClient';

// Force static generation for SEO - This ensures the page is pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate - fully static

// Enhanced SEO Metadata for homepage - Optimized for search engines and AI chatbots (International)
// Targeting: US, UK, India markets | Keywords: Restaurant POS, Billing Software, QR Ordering, Voice AI
export const metadata = {
  title: 'Restaurant POS System & Billing Software | AI Voice Ordering | Free Trial | DineOpen',
  description: 'DineOpen - #1 AI-powered restaurant POS and billing software. Voice ordering, QR code menus, GST billing, inventory management. Affordable Square & Toast alternative. Free 30-day trial. Trusted by 500+ restaurants in USA, UK & India.',
  keywords: 'restaurant POS system, restaurant billing software, cloud POS, QR code ordering, voice ordering restaurant, AI restaurant POS, restaurant management software, GST billing software, cafe POS system, bar POS, food truck POS, Square alternative, Toast alternative, Petpooja alternative, affordable restaurant POS, best POS system for restaurants, restaurant point of sale, digital menu ordering, contactless ordering, kitchen display system, inventory management restaurant, table management software, online ordering system restaurant, restaurant analytics, multi-location POS, iPad POS restaurant',
  authors: [{ name: 'DineOpen Team' }],
  creator: 'DineOpen',
  publisher: 'DineOpen',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Restaurant POS & Billing Software | AI Voice Ordering | DineOpen',
    description: 'Affordable restaurant POS with AI voice ordering, QR menus, GST billing & inventory. Better than Square & Toast. Free 30-day trial. No transaction fees.',
    url: 'https://www.dineopen.com',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Restaurant POS System with AI Voice Ordering and QR Code Menus',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS & Billing Software | AI Voice Ordering | DineOpen',
    description: 'AI-powered restaurant POS with voice ordering, QR menus & zero transaction fees. Better than Square, Toast & Petpooja. Free 30-day trial.',
    images: ['https://www.dineopen.com/og-image.jpg'],
    creator: '@dineopen',
  },
  alternates: {
    canonical: 'https://www.dineopen.com',
    languages: {
      'en-US': 'https://www.dineopen.com',
      'en-GB': 'https://www.dineopen.com',
      'en-IN': 'https://www.dineopen.com',
    },
  },
  category: 'Restaurant POS Software',
  classification: 'Business Software',
  other: {
    'application-name': 'DineOpen',
    'apple-mobile-web-app-title': 'DineOpen',
    'format-detection': 'telephone=no',
    'geo.region': 'US;GB;IN',
    'geo.placename': 'United States, United Kingdom, India',
    'rating': 'General',
    'revisit-after': '7 days',
    'distribution': 'global',
  },
};

// This page is statically generated at build time for optimal SEO
// The metadata above is server-rendered and included in the static HTML
// HomePageClient is a client component but Next.js pre-renders the initial HTML
export default function HomePage() {
  return <HomePageClient />;
}
