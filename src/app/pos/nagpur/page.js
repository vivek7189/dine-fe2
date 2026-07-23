import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Nagpur | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Nagpur restaurants. GST billing, Marathi/Hindi menus, Zomato/Swiggy integration, UPI payments. Perfect for Saoji cuisine & orange city restaurants.',
  keywords: 'restaurant POS Nagpur, billing software Nagpur, restaurant management Nagpur, GST billing software Nagpur, Saoji food POS, Vidarbha cuisine billing, Nagpuri restaurant software',
  openGraph: {
    title: 'Best Restaurant POS Software in Nagpur | DineOpen',
    description: 'Top-rated restaurant POS for Nagpur. GST billing, Marathi support, delivery integration. Free trial.',
    url: 'https://www.dineopen.com/pos/nagpur',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/nagpur',
  },
};

export default function NagpurPOSPage() {
  const cityData = {
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Maharashtra',
      'Marathi & Hindi voice ordering',
      'Zomato & Swiggy direct integration',
      'Perfect for Saoji restaurants',
      'UPI, GPay, PhonePe payments',
      'Tarri poha shop quick billing',
    ],
    restaurants: '900+',
    testimonial: {
      quote: 'Nagpur\'s Saoji cuisine needs spice level customization. DineOpen handles all variants perfectly. Our kitchen display shows spice preferences clearly.',
      author: 'Pramod Meshram',
      business: 'Authentic Saoji House, Nagpur',
    },
    localKeywords: ['Sitabuldi', 'Dharampeth', 'Sadar', 'Civil Lines', 'Pratap Nagar', 'Manish Nagar', 'Hingna', 'Wardhaman Nagar'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Nagpur",
    "description": "Restaurant POS and billing software for Nagpur restaurants with GST billing and Marathi support.",
    "url": "https://www.dineopen.com/pos/nagpur",
    "areaServed": { "@type": "City", "name": "Nagpur", "containedInPlace": { "@type": "State", "name": "Maharashtra" } },
    "priceRange": "₹₹",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Nagpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Nagpur, offering GST-compliant billing for Maharashtra, Marathi and Hindi voice ordering, and features perfect for Saoji restaurants and tarri poha shops. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Nagpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Nagpur restaurants. Orders from Sitabuldi, Dharampeth, Sadar, and Civil Lines flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Nagpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Nagpur restaurants, including GST billing, spice level customization for Saoji cuisine, QR menus, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Marathi voice ordering in Nagpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Marathi and Hindi, perfect for Nagpur's Saoji restaurants and Vidarbha cuisine eateries. Kitchen displays show spice preferences clearly."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Nagpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Nagpur restaurants. No credit card required. Get full access to Marathi language support, GST billing, and Saoji cuisine customization features."
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
