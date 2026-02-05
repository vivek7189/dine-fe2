import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Mumbai | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Mumbai restaurants. GST billing, QR menus, Zomato/Swiggy integration, UPI payments. AI voice ordering in Hindi & English. Free 30-day trial.',
  keywords: 'restaurant POS Mumbai, billing software Mumbai, restaurant management Mumbai, GST billing software Mumbai, cafe POS Mumbai, bar POS Mumbai, Zomato integration Mumbai, Swiggy POS Mumbai, QR menu Mumbai',
  openGraph: {
    title: 'Best Restaurant POS Software in Mumbai | DineOpen',
    description: 'Top-rated restaurant POS for Mumbai. GST billing, Zomato/Swiggy integration, UPI. Free trial.',
    url: 'https://www.dineopen.com/pos/mumbai',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/mumbai',
  },
};

export default function MumbaiPOSPage() {
  const cityData = {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Maharashtra',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'AI voice ordering in Hindi & Marathi',
      'Works offline during monsoons',
    ],
    restaurants: '50,000+',
    testimonial: {
      quote: 'DineOpen helped us manage our 3 outlets in Andheri, Bandra, and Colaba from one dashboard. The GST reports save us hours every month.',
      author: 'Rahul Sharma',
      business: 'Cafe Mumbai Chain',
    },
    localKeywords: ['Andheri', 'Bandra', 'Colaba', 'Juhu', 'Lower Parel', 'BKC', 'Powai', 'Thane'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Mumbai",
    "description": "Restaurant POS and billing software for Mumbai restaurants with GST billing and Zomato/Swiggy integration.",
    "url": "https://www.dineopen.com/pos/mumbai",
    "areaServed": { "@type": "City", "name": "Mumbai", "containedInPlace": { "@type": "State", "name": "Maharashtra" } },
    "priceRange": "₹₹",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
