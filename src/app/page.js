import HomePageClient from './HomePageClient';
import SEOStructuredData from '../components/SEOStructuredData';
import Link from 'next/link';

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

// Server component: structured data + SEO content rendered as static HTML
// HomePageClient handles all interactive UI on top
export default function HomePage() {
  return (
    <>
      {/* Server-rendered structured data - guaranteed in HTML even without JS */}
      <SEOStructuredData />

      {/* Server-rendered SEO content block - crawlers always see this text in HTML source */}
      {/* Visually hidden but readable by search engines and AI crawlers */}
      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
        aria-hidden="false"
      >
        <h1>DineOpen - The Global Restaurant Operating System</h1>
        <p>
          DineOpen powers restaurants worldwide with an all-in-one operating system.
          Cloud POS, AI-powered voice ordering, waiter apps, table reservations,
          inventory management, analytics, and loyalty programs.
          Trusted by 1000+ restaurants across 20+ countries.
        </p>
        <h2>Products</h2>
        <nav aria-label="Products">
          <ul>
            <li><Link href="/products/pos">DineOpen POS - Lightning-Fast Cloud POS, bill in 3 seconds</Link></li>
            <li><Link href="/products/menu">DineOpen Menu - Digital menu builder with QR codes and 6 themes</Link></li>
            <li><Link href="/products/orders">DineOpen Orders - Online ordering, QR ordering, delivery management</Link></li>
            <li><Link href="/products/loyalty">DineOpen Loyalty - Customer CRM, rewards, and WhatsApp marketing</Link></li>
            <li><Link href="/products/hotel">DineOpen Hotel - Room management, bookings, and front desk</Link></li>
            <li><Link href="/products/kitchen">DineOpen Kitchen - Kitchen display system and KOT management</Link></li>
            <li><Link href="/products/ai">DineOpen AI - Voice ordering and AI chat assistant</Link></li>
            <li><Link href="/products/inventory">DineOpen Inventory - Smart stock tracking with AI reorder</Link></li>
            <li><Link href="/products/tables">DineOpen Tables - Table management and reservations</Link></li>
            <li><Link href="/products/billing">DineOpen Billing - GST-compliant billing software</Link></li>
            <li><Link href="/products/admin">DineOpen Admin - Staff management and multi-restaurant control</Link></li>
          </ul>
        </nav>
        <h2>Pricing</h2>
        <p>
          DineOpen Spark plan starts at $9.99 per month internationally and ₹300 per month in India.
          Blaze plan for restaurant chains at $89 per month. All plans include a 30-day free trial
          with zero transaction fees.
        </p>
        <h2>Industries</h2>
        <nav aria-label="Industries">
          <ul>
            <li><Link href="/for/restaurants">POS for Restaurants</Link></li>
            <li><Link href="/for/cafes">POS for Cafes</Link></li>
            <li><Link href="/for/cloud-kitchens">POS for Cloud Kitchens</Link></li>
            <li><Link href="/for/bars-pubs">POS for Bars and Pubs</Link></li>
            <li><Link href="/for/bakeries">POS for Bakeries</Link></li>
            <li><Link href="/for/hotels">POS for Hotels</Link></li>
            <li><Link href="/for/food-trucks">POS for Food Trucks</Link></li>
            <li><Link href="/for/qsr">POS for QSR and Fast Food</Link></li>
          </ul>
        </nav>
        <h2>Compare Alternatives</h2>
        <nav aria-label="Alternatives">
          <ul>
            <li><Link href="/alternatives/petpooja">DineOpen vs Petpooja Alternative</Link></li>
            <li><Link href="/alternatives/toast">DineOpen vs Toast Alternative</Link></li>
            <li><Link href="/alternatives/square">DineOpen vs Square Alternative</Link></li>
            <li><Link href="/alternatives/posist">DineOpen vs POSist Alternative</Link></li>
            <li><Link href="/alternatives/zomato-base">DineOpen vs Zomato Base Alternative</Link></li>
          </ul>
        </nav>
        <h2>Free Tools</h2>
        <nav aria-label="Free Tools">
          <ul>
            <li><Link href="/tools/food-cost-calculator">Food Cost Calculator</Link></li>
            <li><Link href="/tools/break-even-calculator">Break Even Calculator</Link></li>
            <li><Link href="/tools/qr-menu-generator">QR Menu Generator</Link></li>
            <li><Link href="/tools/restaurant-name-generator">Restaurant Name Generator</Link></li>
            <li><Link href="/tools/roi-calculator">ROI Calculator</Link></li>
          </ul>
        </nav>
        <h2>Locations</h2>
        <nav aria-label="Locations">
          <ul>
            <li><Link href="/pos/mumbai">Restaurant POS Mumbai</Link></li>
            <li><Link href="/pos/delhi">Restaurant POS Delhi</Link></li>
            <li><Link href="/pos/bangalore">Restaurant POS Bangalore</Link></li>
            <li><Link href="/pos/usa">Restaurant POS USA</Link></li>
            <li><Link href="/pos/uk">Restaurant POS UK</Link></li>
            <li><Link href="/pos/uae">Restaurant POS UAE</Link></li>
          </ul>
        </nav>
      </div>

      {/* Interactive client component */}
      <HomePageClient />
    </>
  );
}
