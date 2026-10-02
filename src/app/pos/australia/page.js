import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Australia | Sydney, Melbourne | DineOpen',
  description: 'Restaurant POS software for Australia. Cloud-based billing, GST compliance, QR ordering, Uber Eats & Menulog integration. Perfect for Australian restaurants & cafes. From $20/month (USD). Free trial.',
  keywords: 'restaurant POS Australia, POS system Sydney, restaurant software Melbourne, GST billing software Australia, cloud POS Australia, QR menu Australia, cafe POS Sydney, restaurant management Melbourne, hospitality POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Australia | DineOpen',
    description: 'Cloud-based restaurant POS for Australia with GST compliance and delivery integration.',
    url: 'https://www.dineopen.com/pos/australia',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/australia',
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

export default function AustraliaPOSPage() {
  const cityData = {
    city: 'Australia',
    state: 'NSW, VIC & More',
    country: 'Australia',
    currency: '$',
    price: '20',
    deliveryPlatforms: 'Connect with Uber Eats, Menulog & DoorDash',
    highlights: [
      'GST-compliant billing for Australia',
      'Uber Eats & Menulog integration',
      'Cafe culture optimized features',
      'Award wage & penalty rate tracking',
      'Multi-venue management for groups',
      'QR ordering with tap-to-pay support',
    ],
    localKeywords: [
      'Sydney CBD', 'Melbourne CBD', 'Brisbane', 'Perth', 'Adelaide',
      'Surry Hills', 'Fitzroy', 'Newtown', 'South Yarra', 'Bondi',
      'Gold Coast', 'Canberra', 'Parramatta', 'St Kilda', 'Fremantle', 'Fortitude Valley',
    ],
    complianceInfo: [
      { title: 'GST 10% Compliant', desc: 'Automatic GST at 10% on all applicable items. BAS-ready reporting for quarterly or monthly lodgement.' },
      { title: 'Food Safety Standards', desc: 'Supports food safety record keeping aligned with Food Standards Australia New Zealand (FSANZ) requirements.' },
      { title: 'Fair Work Compliant', desc: 'Staff scheduling considers award wage rates and penalty rates for weekends and public holidays.' },
    ],
    paymentMethods: ['EFTPOS', 'Apple Pay', 'Google Pay', 'Afterpay', 'Visa', 'Mastercard', 'Cash (AUD)'],
    localCompetitors: [
      { name: 'Lightspeed', price: 'AUD 79/mo', note: 'Feature-rich but steep learning curve' },
      { name: 'Square', price: '1.6% per txn', note: 'Simple but limited restaurant-specific tools' },
      { name: 'Kounta (Lightspeed K)', price: 'AUD 59/mo', note: 'Hospitality-focused but being merged into Lightspeed' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Australia",
    "description": "Best restaurant POS software for Australia with GST compliance and cafe-focused features.",
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
      "name": "Australia"
    }
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
