import HomePageClient from './HomePageClient';

// Force static generation for SEO - This ensures the page is pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate - fully static

// Enhanced SEO Metadata for homepage - Optimized for search engines and AI chatbots (International)
export const metadata = {
  title: 'AI-Powered Restaurant Management System | Next-Gen POS & AI Agent | DineOpen',
  description: 'DineOpen - The AI Agent-powered restaurant management platform. Autonomous AI takes orders via voice & chat 24/7, manages reservations, and runs your restaurant operations. Cloud-based POS, QR menus, inventory tracking. Starting at $10/month. Trusted by 500+ restaurants worldwide.',
  keywords: 'AI restaurant management, AI agent for restaurants, restaurant AI assistant, autonomous restaurant POS, AI voice ordering system, restaurant management software, cloud POS system, QR code menu, digital ordering, restaurant automation, AI waiter, voice AI ordering, restaurant inventory management, table management system, kitchen display system, restaurant analytics, hospitality technology, food service automation, smart restaurant, next-gen POS',
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
    title: 'AI-Powered Restaurant Management | Next-Gen POS with AI Agent | DineOpen',
    description: 'Transform your restaurant with AI. Our autonomous AI Agent handles orders, reservations & customer service 24/7. Cloud POS, QR menus, real-time analytics. Starting at $10/month.',
    url: 'https://www.dineopen.com',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen - AI-Powered Restaurant Management System with Autonomous AI Agent',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Restaurant Management | Autonomous AI Agent | DineOpen',
    description: 'Next-gen restaurant platform with AI Agent that takes orders, manages reservations & handles operations 24/7. Cloud POS, QR menus, analytics. From $10/month.',
    images: ['https://www.dineopen.com/favicon.png'],
    creator: '@dineopen',
  },
  alternates: {
    canonical: 'https://www.dineopen.com',
  },
  category: 'Restaurant Management Software',
  classification: 'Business Software',
  other: {
    'application-name': 'DineOpen',
    'apple-mobile-web-app-title': 'DineOpen',
    'format-detection': 'telephone=no',
  },
};

// This page is statically generated at build time for optimal SEO
// The metadata above is server-rendered and included in the static HTML
// HomePageClient is a client component but Next.js pre-renders the initial HTML
export default function HomePage() {
  return <HomePageClient />;
}
