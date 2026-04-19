import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Australia | Sydney, Melbourne | DineOpen',
  description: 'Top-rated restaurant POS software for Australia. Cloud-based billing, GST compliance, QR ordering, Uber Eats & Menulog integration. Perfect for Australian restaurants & cafes. AUD 39/month. Free trial.',
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
    currency: 'AUD ',
    price: '39',
    restaurants: '70+',
    deliveryPlatforms: 'Connect with Uber Eats, Menulog & DoorDash',
    highlights: [
      'GST-compliant billing for Australia',
      'Uber Eats & Menulog integration',
      'Cafe culture optimized features',
      'Award wage & penalty rate tracking',
      'Multi-venue management for groups',
      'QR ordering with tap-to-pay support',
    ],
    testimonial: {
      quote: 'Melbourne cafe culture demands speed and style. DineOpen gives us both - beautiful QR menus our customers love and fast billing that keeps the queue moving.',
      author: 'Sarah Chen',
      business: 'Flat White Cafe, Melbourne',
    },
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
      "price": "39",
      "priceCurrency": "AUD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Australia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a top-rated restaurant POS for Australia, offering GST-compliant billing, Uber Eats and Menulog integration, cafe culture optimized features, and QR ordering with tap-to-pay. Plans start at AUD 39/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Uber Eats and Menulog in Australia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Uber Eats and Menulog across all Australian cities. Orders from Sydney, Melbourne, Brisbane, and Perth flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Australia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at AUD 39/month for Australian restaurants and cafes. This includes GST-compliant billing, QR ordering, delivery integration, and multi-venue management. No long-term contracts."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support English voice ordering in Australia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in English, perfect for Australian cafes and restaurants. Staff can take orders hands-free during busy brunch rushes and weekend peaks."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Australia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Australian restaurants and cafes. No credit card required. Get full access to GST billing, delivery integrations, and cafe-focused features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
