import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System USA | AI Voice Ordering | Square Alternative | DineOpen',
  description: 'Best restaurant POS for US restaurants. AI voice ordering, QR menus, zero transaction fees (save vs Square 2.6%). Works with Toast, Clover hardware. Free 7-day trial.',
  keywords: 'restaurant POS USA, restaurant POS system America, US restaurant software, Square alternative USA, Toast alternative, restaurant billing software USA, cafe POS USA, bar POS system, American restaurant POS, QR menu ordering USA',
  openGraph: {
    title: 'Restaurant POS System USA | AI Voice Ordering | DineOpen',
    description: 'AI-powered restaurant POS for US restaurants. Zero transaction fees, Square alternative. Free trial.',
    url: 'https://www.dineopen.com/pos/usa',
    siteName: 'DineOpen',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/usa',
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

export default function USAPOSPage() {
  const cityData = {
    city: 'United States',
    state: '',
    country: 'USA',
    currency: '$',
    currencyCode: 'USD',
    price: '20',
    highlights: [
      'Zero transaction fees (save vs Square 2.6%)',
      'AI voice ordering in English & Spanish',
      'Works on any device - no hardware lock-in',
      'DoorDash, Uber Eats, Grubhub ready',
      'Month-to-month billing, no contracts',
    ],
    deliveryPlatforms: 'Connect with DoorDash, Uber Eats & Grubhub',
    localKeywords: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Seattle', 'Austin', 'Denver', 'Boston'],
    complianceInfo: [
      { title: 'State Sales Tax', desc: 'Automatic sales tax calculation for all 50 states. Handles complex rules like food vs prepared food rates.' },
      { title: 'Tip Reporting', desc: 'IRS-compliant tip tracking, tip pooling, and automatic Form 8027 preparation for tipped employees.' },
      { title: 'ADA Compliance', desc: 'QR menus with screen reader support and accessible design for ADA compliance.' },
    ],
    paymentMethods: ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Cash App', 'Venmo', 'Cash', 'Debit'],
    localCompetitors: [
      { name: 'Toast', price: '$165/mo + 2.49%', note: 'Hardware lock-in, long-term contracts required' },
      { name: 'Square', price: 'Free + 2.6%', note: 'Transaction fees add up, limited restaurant features' },
      { name: 'Clover', price: '$90/mo + 2.3%', note: 'Tied to Fiserv processing, complex pricing tiers' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS USA",
    "description": "AI-powered restaurant POS system for US restaurants with zero transaction fees.",
    "url": "https://www.dineopen.com/pos/usa",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "20",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "areaServed": { "@type": "Country", "name": "United States" },
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
