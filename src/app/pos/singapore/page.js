import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Singapore | Cloud POS | DineOpen',
  description: 'Top-rated restaurant POS software for Singapore. GST-compliant billing, QR ordering, GrabFood & Foodpanda integration. Perfect for hawker stalls, cafes & restaurants. SGD 49/month. Free trial.',
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
    currency: 'SGD ',
    price: '49',
    restaurants: '100+',
    deliveryPlatforms: 'Connect with GrabFood, Foodpanda & Deliveroo',
    highlights: [
      'GST-compliant billing for Singapore',
      'English, Mandarin, Malay, Tamil support',
      'GrabFood & Foodpanda integration',
      'Hawker stall & kopitiam optimized',
      'QR ordering with PayNow/NETS support',
      'Multi-outlet chain management',
    ],
    testimonial: {
      quote: 'We started with one hawker stall and now have 5 outlets. DineOpen scaled with us perfectly. The multi-outlet dashboard saves hours of work and GST filing is automatic.',
      author: 'David Tan',
      business: 'Lucky Chicken Rice Chain',
    },
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
      "price": "49",
      "priceCurrency": "SGD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Singapore"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Singapore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a top-rated restaurant POS for Singapore, offering GST-compliant billing, GrabFood and Foodpanda integration, hawker stall optimization, and support for English, Mandarin, Malay, and Tamil. Plans start at SGD 49/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support GrabFood and Foodpanda in Singapore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with GrabFood and Foodpanda across Singapore. Orders from Orchard Road, Marina Bay, Clarke Quay, and Chinatown flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Singapore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at SGD 49/month for Singapore restaurants and hawker stalls. This includes GST-compliant billing, QR ordering with PayNow/NETS, and multi-outlet chain management. No long-term contracts."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support multilingual voice ordering in Singapore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in English, Mandarin, Malay, and Tamil, perfect for Singapore's multilingual food scene. Staff can take orders in their preferred language."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Singapore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Singapore restaurants and hawker stalls. No credit card required. Get full access to GST billing, GrabFood integration, and kopitiam optimized features."
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
