import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Canada | Toronto, Vancouver | DineOpen',
  description: 'Restaurant POS software for Canada. Cloud-based billing, HST/GST compliance, QR ordering, Skip & DoorDash integration. Perfect for Canadian restaurants. From $20/month (USD). Free trial.',
  keywords: 'restaurant POS Canada, POS system Toronto, restaurant software Vancouver, HST billing software, cloud POS Canada, QR menu Canada, Indian restaurant POS Toronto, cafe billing Vancouver, restaurant management Canada',
  openGraph: {
    title: 'Best Restaurant POS Software in Canada | DineOpen',
    description: 'Cloud-based restaurant POS for Canada with HST/GST compliance and delivery integration.',
    url: 'https://www.dineopen.com/pos/canada',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/canada',
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

export default function CanadaPOSPage() {
  const cityData = {
    city: 'Canada',
    state: 'Ontario, BC & More',
    country: 'Canada',
    currency: '$',
    price: '20',
    deliveryPlatforms: 'Connect with Skip The Dishes, DoorDash & Uber Eats',
    highlights: [
      'HST/GST/PST compliant billing',
      'English & French language support',
      'Skip The Dishes & DoorDash integration',
      'Tip pooling & gratuity management',
      'Multi-province tax configuration',
      'Winter-ready offline mode',
    ],
    localKeywords: [
      'Toronto Downtown', 'Brampton', 'Mississauga', 'Vancouver Downtown', 'Surrey',
      'Calgary', 'Edmonton', 'Montreal', 'Ottawa', 'Winnipeg',
      'Scarborough', 'North York', 'Richmond', 'Burnaby', 'Markham', 'Vaughan',
    ],
    complianceInfo: [
      { title: 'HST/GST/PST by Province', desc: 'Automatic tax calculation handling HST (Ontario, BC), GST+PST (Manitoba, Saskatchewan), and GST-only (Alberta) rules.' },
      { title: 'Tip-Out Rules', desc: 'Compliant tip pooling and tip-out management following provincial employment standards.' },
      { title: 'Bilingual Support', desc: 'Full English and French language menus and receipts for Quebec compliance.' },
    ],
    paymentMethods: ['Interac', 'Apple Pay', 'Google Pay', 'Debit Tap', 'Visa', 'Mastercard', 'Cash (CAD)'],
    localCompetitors: [
      { name: 'TouchBistro', price: 'CAD 69/mo', note: 'iPad-only, no Android or web POS option' },
      { name: 'Square', price: '2.65% per txn', note: 'Generic POS, not restaurant-specialized' },
      { name: 'Lightspeed', price: 'CAD 89/mo', note: 'Powerful but complex pricing with add-ons' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Canada",
    "description": "Best restaurant POS software for Canada with HST/GST compliance and delivery platform integration.",
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
      "name": "Canada"
    }
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
