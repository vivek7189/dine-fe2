import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Singapore | Cloud POS | DineOpen',
  description: 'Restaurant POS software for Singapore. GST-compliant billing, QR ordering, GrabFood & Foodpanda integration. Perfect for hawker stalls, cafes & restaurants. From $20/month (USD). Free trial.',
  keywords: 'restaurant POS Singapore, hawker stall POS, cafe billing Singapore, GST POS Singapore, cloud POS Singapore, QR ordering Singapore, GrabFood integration, restaurant software Singapore, kopitiam POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Singapore | DineOpen',
    description: 'Cloud-based restaurant POS for Singapore with GST compliance, hawker stall support, and delivery integration.',
    url: 'https://www.dineopen.com/pos/singapore',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/singapore',
    languages: {
      'x-default': 'https://www.dineopen.com',
      'en-US': 'https://www.dineopen.com/pos/usa',
      'en-GB': 'https://www.dineopen.com/pos/uk',
      'en-IN': 'https://www.dineopen.com/india',
      'en-AE': 'https://www.dineopen.com/pos/uae',
      'en-SG': 'https://www.dineopen.com/pos/singapore',
      'en-CA': 'https://www.dineopen.com/pos/canada',
      'en-AU': 'https://www.dineopen.com/pos/australia',
    },
  },
};

export default function SingaporePOSPage() {
  const cityData = {
    city: 'Singapore',
    state: 'Singapore',
    country: 'Singapore',
    currency: '$',
    price: '20',
    deliveryPlatforms: 'Connect with GrabFood, Foodpanda & Deliveroo',
    highlights: [
      'GST-compliant billing for Singapore',
      'English, Mandarin, Malay, Tamil support',
      'GrabFood & Foodpanda integration',
      'Hawker stall & kopitiam optimized',
      'QR ordering with PayNow/NETS support',
      'Multi-outlet chain management',
    ],
    localKeywords: [
      'Orchard Road', 'Marina Bay', 'Clarke Quay', 'Chinatown', 'Little India',
      'Bugis', 'Tanjong Pagar', 'Holland Village', 'Tiong Bahru', 'Katong',
      'Jurong', 'Tampines', 'Woodlands', 'Sentosa', 'Raffles Place', 'Novena',
    ],
    complianceInfo: [
      { title: 'GST 9% Compliant', desc: 'Automatic GST at 9% (updated 2024). Handles GST-inclusive pricing display as preferred in Singapore.' },
      { title: 'NEA Food Safety', desc: 'Digital record keeping aligned with National Environment Agency (NEA) food safety requirements.' },
      { title: 'SFA Licensing', desc: 'Works with Singapore Food Agency licensing. Track food handler certifications and expiry dates.' },
    ],
    paymentMethods: ['PayNow', 'GrabPay', 'NETS', 'Apple Pay', 'Google Pay', 'Visa', 'Mastercard', 'Cash (SGD)'],
    localCompetitors: [
      { name: 'StoreHub', price: 'SGD 59/mo', note: 'Popular in SEA but limited AI capabilities' },
      { name: 'Lightspeed', price: 'SGD 99/mo', note: 'Enterprise features but expensive for hawker stalls' },
      { name: 'Revel', price: 'SGD 99/mo', note: 'US-focused, limited local payment integrations' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Singapore",
    "description": "Best restaurant POS software for Singapore with GST compliance, hawker support, and delivery integration.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "20",
      "priceCurrency": "USD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Singapore"
    }
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
