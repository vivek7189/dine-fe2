import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Lucknow | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Lucknow. AI-powered billing, GST compliance, QR code ordering. Perfect for Awadhi cuisine, kebab shops & biryani restaurants. Start free trial.',
  keywords: 'restaurant POS Lucknow, billing software Lucknow, restaurant software UP, GST billing Lucknow, cloud POS Lucknow, QR menu Lucknow, kebab shop POS, Awadhi restaurant software, biryani restaurant POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Lucknow | DineOpen',
    description: 'AI-powered restaurant POS for Lucknow. GST compliant billing, QR menus, Awadhi cuisine support.',
    url: 'https://www.dineopen.com/pos/lucknow',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/lucknow',
  },
};

export default function LucknowPOSPage() {
  const cityData = {
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '200+',
    highlights: [
      'Hindi & Urdu voice ordering support',
      'GST-compliant billing for Uttar Pradesh',
      'Awadhi cuisine & kebab shop features',
      'Biryani portion management (half/full/family)',
      'Sweet shop (mithai) inventory tracking',
      'Swiggy & Zomato integration for Nawabi city',
    ],
    testimonial: {
      quote: 'Lucknow is the food capital of North India. DineOpen understands our kebab and biryani business perfectly. The portion management feature saves us from order confusion every day.',
      author: 'Mohammed Farhan',
      business: 'Tunday Kababi Style Restaurant',
    },
    localKeywords: [
      'Hazratganj', 'Gomti Nagar', 'Aminabad', 'Chowk', 'Alambagh',
      'Aliganj', 'Indira Nagar', 'Mahanagar', 'Kaiserbagh', 'Charbagh',
      'Vikas Nagar', 'Jankipuram', 'Rajajipuram', 'Aashiana', 'Faizabad Road', 'Kanpur Road',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Lucknow",
    "description": "Best restaurant POS software for Lucknow restaurants with Awadhi cuisine support, kebab shop features, and GST billing.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "City",
      "name": "Lucknow",
      "containedInPlace": {
        "@type": "State",
        "name": "Uttar Pradesh"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Lucknow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Lucknow, offering GST-compliant billing for UP, Hindi and Urdu voice ordering, Awadhi cuisine features, and kebab shop portion management. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Lucknow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Lucknow restaurants. Orders from Hazratganj, Gomti Nagar, Aminabad, and Chowk flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Lucknow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Lucknow restaurants, including GST billing, biryani portion management (half/full/family), QR menus, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi and Urdu voice ordering in Lucknow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi, Urdu, and English, perfect for Lucknow's Nawabi cuisine restaurants and kebab shops. Staff can take orders hands-free during busy hours."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Lucknow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Lucknow restaurants and kebab shops. No credit card required. Get full access to Awadhi cuisine features, GST billing, and delivery integrations."
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
