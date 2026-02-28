import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Delhi NCR | GST Billing | DineOpen',
  description: 'Best restaurant POS for Delhi, Gurgaon, Noida restaurants. GST billing, QR menus, Zomato/Swiggy integration, UPI payments. AI voice ordering in Hindi. Free 30-day trial.',
  keywords: 'restaurant POS Delhi, billing software Delhi, restaurant management Delhi NCR, GST billing software Delhi, cafe POS Gurgaon, bar POS Noida, Zomato integration Delhi, QR menu Delhi',
  openGraph: {
    title: 'Best Restaurant POS Software in Delhi NCR | DineOpen',
    description: 'Top-rated restaurant POS for Delhi NCR. GST billing, Zomato/Swiggy integration. Free trial.',
    url: 'https://www.dineopen.com/pos/delhi',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/delhi',
  },
};

export default function DelhiPOSPage() {
  const cityData = {
    city: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Delhi',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, Paytm payments',
      'AI voice ordering in Hindi & English',
      'Multi-outlet management for chains',
    ],
    restaurants: '80,000+',
    testimonial: {
      quote: 'Managing our dhaba chain across Delhi and Gurgaon became so easy with DineOpen. The Hindi voice ordering is a game-changer for our staff.',
      author: 'Vikram Singh',
      business: 'Punjab Da Dhaba',
    },
    localKeywords: ['Connaught Place', 'Khan Market', 'Hauz Khas', 'Gurgaon', 'Noida', 'Dwarka', 'Karol Bagh', 'Saket'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Delhi NCR",
    "description": "Restaurant POS and billing software for Delhi NCR restaurants.",
    "url": "https://www.dineopen.com/pos/delhi",
    "areaServed": { "@type": "City", "name": "Delhi" },
    "priceRange": "₹₹",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Delhi NCR?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Delhi NCR, offering GST-compliant billing, Zomato and Swiggy integration, UPI payments, and AI voice ordering in Hindi. Plans start at just ₹999/month with a free 30-day trial."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Delhi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Delhi NCR restaurants. Orders flow automatically into your POS, reducing errors and speeding up delivery across Connaught Place, Khan Market, Gurgaon, and Noida."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Delhi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Delhi NCR restaurants, including GST billing, QR menus, and delivery integration. There are no hidden fees, and all prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Delhi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Delhi NCR restaurants. Staff can take orders hands-free in Hindi, improving speed and accuracy during peak hours."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Delhi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Delhi NCR restaurants. No credit card required. You get full access to GST billing, Zomato/Swiggy integration, and AI voice ordering features."
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
