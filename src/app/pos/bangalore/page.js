import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Bangalore | GST Billing | DineOpen',
  description: 'Best restaurant POS for Bangalore restaurants & cafes. GST billing, QR menus, Zomato/Swiggy integration, UPI. AI voice ordering. Trusted by Indiranagar & Koramangala cafes. Free trial.',
  keywords: 'restaurant POS Bangalore, billing software Bangalore, restaurant management Bangalore, GST billing software Bangalore, cafe POS Bangalore, Indiranagar restaurants, Koramangala cafes, QR menu Bangalore',
  openGraph: {
    title: 'Best Restaurant POS Software in Bangalore | DineOpen',
    description: 'Top-rated restaurant POS for Bangalore. GST billing, Zomato/Swiggy integration. Free trial.',
    url: 'https://www.dineopen.com/pos/bangalore',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/bangalore',
  },
};

export default function BangalorePOSPage() {
  const cityData = {
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Karnataka',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'AI voice ordering in English & Kannada',
      'Cloud-first for tech-savvy restaurants',
    ],
    restaurants: '45,000+',
    testimonial: {
      quote: 'As a cloud kitchen in HSR Layout, DineOpen\'s Swiggy integration and real-time analytics helped us optimize our menu and increase orders by 40%.',
      author: 'Priya Menon',
      business: 'Bowl & Spoon Cloud Kitchen',
    },
    localKeywords: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'MG Road', 'JP Nagar', 'Marathahalli', 'Electronic City'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Bangalore",
    "description": "Restaurant POS and billing software for Bangalore restaurants and cafes.",
    "url": "https://www.dineopen.com/pos/bangalore",
    "areaServed": { "@type": "City", "name": "Bangalore" },
    "priceRange": "₹₹",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Bangalore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Bangalore, offering GST-compliant billing for Karnataka, Zomato and Swiggy integration, UPI payments, and AI voice ordering in English and Kannada. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Bangalore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Bangalore restaurants. Orders from Indiranagar, Koramangala, HSR Layout, and Whitefield flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Bangalore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Bangalore restaurants, including GST billing, QR menus, and delivery integration. All prices are GST-inclusive with no hidden charges."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Kannada voice ordering in Bangalore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in both English and Kannada, perfect for Bangalore's diverse restaurant scene. The cloud-first approach is ideal for tech-savvy restaurant owners."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Bangalore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Bangalore restaurants and cloud kitchens. No credit card required. Get full access to GST billing, Swiggy/Zomato integration, and real-time analytics."
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
