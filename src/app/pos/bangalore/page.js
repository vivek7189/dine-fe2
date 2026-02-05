import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Bangalore | GST Billing | DineOpen',
  description: 'Best restaurant POS for Bangalore restaurants & cafes. GST billing, QR menus, Zomato/Swiggy integration, UPI. AI voice ordering. Trusted by Indiranagar & Koramangala cafes. Free trial.',
  keywords: 'restaurant POS Bangalore, billing software Bangalore, restaurant management Bangalore, GST billing software Bangalore, cafe POS Bangalore, Indiranagar restaurants, Koramangala cafes, QR menu Bangalore',
  openGraph: {
    title: 'Best Restaurant POS Software in Bangalore | DineOpen',
    description: 'Top-rated restaurant POS for Bangalore. GST billing, Zomato/Swiggy integration. Free trial.',
    url: 'https://www.dineopen.com/pos/bangalore',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/bangalore',
  },
};

export default function BangalorePOSPage() {
  const cityData = {
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Karnataka',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'AI voice ordering in English & Kannada',
      'Cloud-first for tech-savvy restaurants',
    ],
    restaurants: '45,000+',
    testimonial: {
      quote: 'As a cloud kitchen in HSR Layout, DineOpen\'s Swiggy integration and real-time analytics helped us optimize our menu and increase orders by 40%.',
      author: 'Priya Menon',
      business: 'Bowl & Spoon Cloud Kitchen',
    },
    localKeywords: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'MG Road', 'JP Nagar', 'Marathahalli', 'Electronic City'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Bangalore",
    "description": "Restaurant POS and billing software for Bangalore restaurants and cafes.",
    "url": "https://www.dineopen.com/pos/bangalore",
    "areaServed": { "@type": "City", "name": "Bangalore" },
    "priceRange": "₹₹",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
