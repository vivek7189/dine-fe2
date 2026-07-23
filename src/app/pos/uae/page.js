import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in UAE | Dubai & Abu Dhabi | DineOpen',
  description: 'Top-rated restaurant POS software for UAE. Cloud-based billing, VAT compliance, QR ordering, multi-language support. Perfect for Dubai & Abu Dhabi restaurants. AED 149/month. Free trial.',
  keywords: 'restaurant POS UAE, restaurant software Dubai, POS system Abu Dhabi, VAT billing software UAE, cloud POS Dubai, QR menu UAE, Indian restaurant POS Dubai, cafe billing UAE, restaurant management Dubai',
  openGraph: {
    title: 'Best Restaurant POS Software in UAE | Dubai & Abu Dhabi | DineOpen',
    description: 'Cloud-based restaurant POS for UAE with VAT compliance, multi-language menus, and delivery integration.',
    url: 'https://www.dineopen.com/pos/uae',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/uae',
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

export default function UAEPOSPage() {
  const cityData = {
    city: 'UAE',
    state: 'Dubai & Abu Dhabi',
    country: 'United Arab Emirates',
    currency: 'AED ',
    price: '149',
    restaurants: '150+',
    deliveryPlatforms: 'Connect with Talabat, Deliveroo & Careem NOW',
    highlights: [
      'VAT-compliant billing for UAE',
      'Arabic, English, Hindi, Urdu support',
      'Talabat & Deliveroo integration',
      'Multi-currency support (AED, USD, INR)',
      'Indian restaurant specialized features',
      'Mall food court & free zone support',
    ],
    testimonial: {
      quote: 'We run an Indian restaurant in Dubai Marina. DineOpen understands our cuisine, handles VAT perfectly, and the Arabic-English menu switching is seamless for our diverse customers.',
      author: 'Rajesh Nair',
      business: 'Saffron Indian Kitchen, Dubai',
    },
    localKeywords: [
      'Dubai Marina', 'JBR', 'Downtown Dubai', 'Deira', 'Bur Dubai',
      'Business Bay', 'DIFC', 'JLT', 'Abu Dhabi Corniche', 'Yas Island',
      'Sharjah', 'Ajman', 'Al Ain', 'Karama', 'Al Barsha', 'International City',
    ],
    complianceInfo: [
      { title: 'VAT 5% Compliant', desc: 'Automatic VAT at 5% as per UAE Federal Tax Authority. Tax invoice generation with TRN.' },
      { title: 'Dubai Municipality Safety', desc: 'Food safety tracking and hygiene compliance aligned with Dubai Municipality requirements.' },
      { title: 'Trade License Ready', desc: 'Billing system works with mainland and free zone trade licenses across all emirates.' },
    ],
    paymentMethods: ['Apple Pay', 'Samsung Pay', 'Mada', 'Visa', 'Mastercard', 'Cash (AED)', 'Multi-Currency'],
    localCompetitors: [
      { name: 'Foodics', price: 'AED 300+/mo', note: 'Popular in MENA but expensive for small restaurants' },
      { name: 'POSRocket', price: 'AED 200+/mo', note: 'Arabic-first but limited AI features' },
      { name: 'iiko', price: 'Custom pricing', note: 'Enterprise-focused, complex setup' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - UAE",
    "description": "Best restaurant POS software for UAE with VAT compliance, multi-language support, and delivery integration.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "149",
      "priceCurrency": "AED",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Arab Emirates"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in UAE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a top-rated restaurant POS for UAE, offering VAT-compliant billing, Talabat and Deliveroo integration, multi-language support in Arabic, English, Hindi, and Urdu, and multi-currency handling. Plans start at AED 149/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Talabat and Deliveroo in UAE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Talabat and Deliveroo across UAE. Orders from Dubai Marina, Downtown Dubai, Abu Dhabi Corniche, and Sharjah flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in UAE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at AED 149/month for UAE restaurants. This includes VAT-compliant billing, multi-currency support (AED, USD, INR), delivery integration, and mall food court features. No long-term contracts."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Arabic voice ordering in UAE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Arabic, English, Hindi, and Urdu, perfect for UAE's diverse restaurant scene. Seamless Arabic-English menu switching serves your diverse customer base."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in UAE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all UAE restaurants. No credit card required. Get full access to VAT billing, Talabat/Deliveroo integration, and multi-language features."
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
