import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Canada | Toronto, Vancouver | DineOpen',
  description: 'Top-rated restaurant POS software for Canada. Cloud-based billing, HST/GST compliance, QR ordering, Skip & DoorDash integration. Perfect for Canadian restaurants. CAD 39/month. Free trial.',
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
    currency: 'CAD ',
    price: '39',
    restaurants: '80+',
    deliveryPlatforms: 'Connect with Skip The Dishes, DoorDash & Uber Eats',
    highlights: [
      'HST/GST/PST compliant billing',
      'English & French language support',
      'Skip The Dishes & DoorDash integration',
      'Tip pooling & gratuity management',
      'Multi-province tax configuration',
      'Winter-ready offline mode',
    ],
    testimonial: {
      quote: 'As an Indian restaurant in Toronto, we needed a POS that understands our cuisine. DineOpen handles our complex menu perfectly and the Skip integration doubled our delivery orders.',
      author: 'Harpreet Kaur',
      business: 'Punjab Grill, Toronto',
    },
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
      "price": "39",
      "priceCurrency": "CAD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a top-rated restaurant POS for Canada, offering HST/GST/PST compliant billing, English and French language support, Skip The Dishes and DoorDash integration, and tip management. Plans start at CAD 39/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Skip The Dishes and DoorDash in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Skip The Dishes and DoorDash across all Canadian cities. Orders from Toronto, Vancouver, Calgary, and Montreal flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at CAD 39/month for Canadian restaurants. This includes HST/GST/PST compliant billing, delivery integration, tip pooling, and multi-province tax configuration. No long-term contracts."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support English and French voice ordering in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in English and French, perfect for Canadian restaurants across all provinces including Quebec. Staff can take orders hands-free in either language."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Canadian restaurants. No credit card required. Get full access to HST/GST billing, delivery integrations, and winter-ready offline mode."
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
