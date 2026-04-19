import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System USA | AI Voice Ordering | Square Alternative | DineOpen',
  description: 'Best restaurant POS for US restaurants. AI voice ordering, QR menus, zero transaction fees (save vs Square 2.6%). Works with Toast, Clover hardware. Free 30-day trial.',
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
    price: '10',
    highlights: [
      'Zero transaction fees (save vs Square 2.6%)',
      'AI voice ordering in English & Spanish',
      'Works on any device - no hardware lock-in',
      'DoorDash, Uber Eats, Grubhub ready',
      'Month-to-month billing, no contracts',
    ],
    restaurants: 'independent',
    deliveryPlatforms: 'Connect with DoorDash, Uber Eats & Grubhub',
    testimonial: null,
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
      "price": "10",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "areaServed": { "@type": "Country", "name": "United States" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in the USA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a top-rated restaurant POS for the USA, offering zero transaction fees (saving over Square's 2.6%), AI voice ordering in English and Spanish, and seamless DoorDash, Uber Eats, and Grubhub integration. Plans start at just $10/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support DoorDash and Uber Eats in the USA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with DoorDash, Uber Eats, and Grubhub across all US cities. Orders flow automatically into your POS, eliminating tablet chaos and reducing order errors."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in the USA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at just $10/month for US restaurants with zero transaction fees. This includes AI voice ordering, QR menus, delivery integration, and sales tax reporting. No long-term contracts required."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support English and Spanish voice ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in both English and Spanish, making it ideal for diverse US restaurant teams. Staff can take orders hands-free, speeding up drive-thru and counter service."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in the USA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all US restaurants. No credit card required. You get full access to all features including zero-fee payments, AI voice ordering, and delivery platform integrations."
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
