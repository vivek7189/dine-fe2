import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Delhi NCR | GST Billing | DineOpen',
  description: 'Best restaurant POS for Delhi, Gurgaon, Noida restaurants. GST billing, QR menus, Zomato/Swiggy integration, UPI payments. AI voice ordering in Hindi. Free 30-day trial.',
  keywords: 'restaurant POS Delhi, billing software Delhi, restaurant management Delhi NCR, GST billing software Delhi, cafe POS Gurgaon, bar POS Noida, Zomato integration Delhi, QR menu Delhi',
  openGraph: {
    title: 'Best Restaurant POS Software in Delhi NCR | DineOpen',
    description: 'Top-rated restaurant POS for Delhi NCR. GST billing, Zomato/Swiggy integration. Free trial.',
    url: 'https://www.dineopen.com/pos/delhi',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/delhi',
  },
};

export default function DelhiPOSPage() {
  const cityData = {
    city: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Delhi',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, Paytm payments',
      'AI voice ordering in Hindi & English',
      'Multi-outlet management for chains',
    ],
    restaurants: '80,000+',
    testimonial: {
      quote: 'Managing our dhaba chain across Delhi and Gurgaon became so easy with DineOpen. The Hindi voice ordering is a game-changer for our staff.',
      author: 'Vikram Singh',
      business: 'Punjab Da Dhaba',
    },
    localKeywords: ['Connaught Place', 'Khan Market', 'Hauz Khas', 'Gurgaon', 'Noida', 'Dwarka', 'Karol Bagh', 'Saket'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Delhi NCR",
    "description": "Restaurant POS and billing software for Delhi NCR restaurants.",
    "url": "https://www.dineopen.com/pos/delhi",
    "areaServed": { "@type": "City", "name": "Delhi" },
    "priceRange": "₹₹",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
