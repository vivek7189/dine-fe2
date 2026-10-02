import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Indore | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Indore restaurants. GST billing, Hindi menus, Zomato/Swiggy integration, UPI payments. Perfect for Indori street food & namkeen shops.',
  keywords: 'restaurant POS Indore, billing software Indore, restaurant management Indore, GST billing software Indore, Indori food POS, poha jalebi shop billing, namkeen shop POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Indore | DineOpen',
    description: 'Restaurant POS for Indore. GST billing, Hindi support, delivery integration. Free trial.',
    url: 'https://www.dineopen.com/pos/indore',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/indore',
  },
};

export default function IndorePOSPage() {
  const cityData = {
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '899',
    highlights: [
      'GST-compliant billing for MP',
      'Hindi voice ordering & menu',
      'Zomato & Swiggy direct integration',
      'Perfect for poha-jalebi shops',
      'UPI, GPay, PhonePe payments',
      'Namkeen shop weight-based billing',
    ],
    localKeywords: ['Sarafa Bazaar', 'Chappan Dukan', 'Vijay Nagar', 'Palasia', 'MG Road', 'Rau', 'Rajwada', 'Sapna Sangeeta'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Indore",
    "description": "Restaurant POS and billing software for Indore restaurants with GST billing.",
    "url": "https://www.dineopen.com/pos/indore",
    "areaServed": { "@type": "City", "name": "Indore", "containedInPlace": { "@type": "State", "name": "Madhya Pradesh" } },
    "priceRange": "₹₹",
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
