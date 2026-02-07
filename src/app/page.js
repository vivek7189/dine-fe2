import HomePageClient from './HomePageClient';

// Force static generation for SEO - This ensures the page is pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate - fully static

// Enhanced SEO Metadata for homepage - Optimized for search engines and AI chatbots (Global)
// Positioning: "The Global Restaurant Operating System" | "Powering Restaurants Worldwide"
// Targeting: US, UK, India, UAE, Singapore, Canada, Australia markets
export const metadata = {
  title: 'DineOpen | The Global Restaurant Operating System | POS, Inventory & Analytics',
  description: 'DineOpen powers restaurants worldwide with an all-in-one operating system. Cloud POS, waiter apps, table reservations, inventory management, AI analytics & loyalty programs. Trusted by 1000+ restaurants across 20+ countries. Free trial.',
  keywords: 'restaurant operating system, restaurant POS software, cloud POS system, restaurant management platform, waiter ordering app, captain app restaurant, table reservation system, restaurant inventory management, restaurant analytics software, loyalty program restaurant, multi-location restaurant POS, restaurant billing software, kitchen display system, online ordering restaurant, Square alternative, Toast alternative, Petpooja alternative, POSist alternative, best restaurant POS, restaurant technology, food service management, cafe POS, bar POS system, QSR POS, fine dining POS, cloud kitchen software',
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
    title: 'DineOpen | Powering Restaurants Worldwide',
    description: 'The all-in-one restaurant operating system. POS, orders, inventory, analytics & growth tools trusted by 1000+ restaurants globally. Start free trial.',
    url: 'https://www.dineopen.com',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - The Global Restaurant Operating System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen | Powering Restaurants Worldwide',
    description: 'The all-in-one restaurant operating system. POS • Orders • Inventory • Analytics • Growth. Trusted by 1000+ restaurants globally.',
    images: ['https://www.dineopen.com/og-image.jpg'],
    creator: '@dineopen',
  },
  alternates: {
    canonical: 'https://www.dineopen.com',
    languages: {
      'en-US': 'https://www.dineopen.com',
      'en-GB': 'https://www.dineopen.com',
      'en-IN': 'https://www.dineopen.com',
      'en-AE': 'https://www.dineopen.com',
      'en-SG': 'https://www.dineopen.com',
      'en-CA': 'https://www.dineopen.com',
      'en-AU': 'https://www.dineopen.com',
    },
  },
  category: 'Restaurant Management Software',
  classification: 'Business Software',
  other: {
    'application-name': 'DineOpen',
    'apple-mobile-web-app-title': 'DineOpen',
    'format-detection': 'telephone=no',
    'geo.region': 'US;GB;IN;AE;SG;CA;AU',
    'geo.placename': 'Global',
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
