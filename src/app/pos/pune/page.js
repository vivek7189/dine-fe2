import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Pune | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Pune. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 400+ Pune restaurants. Start free trial.',
  keywords: 'restaurant POS Pune, billing software Pune, restaurant software Maharashtra, GST billing Pune, cloud POS Pune, QR menu Pune, cafe POS Pune, restaurant management Pune',
  openGraph: {
    title: 'Best Restaurant POS Software in Pune | DineOpen',
    description: 'AI-powered restaurant POS for Pune. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/pune',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/pune',
  },
};

export default function PunePOSPage() {
  const cityData = {
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '400+',
    highlights: [
      'Marathi language voice ordering support',
      'GST-compliant billing for Maharashtra',
      'Swiggy & Zomato integration for Koregaon Park',
      'College crowd quick-service features',
      'IT Park delivery zone optimization',
      'Multi-outlet support for growing chains',
    ],
    testimonial: {
      quote: 'Pune has so many IT professionals ordering lunch. DineOpen QR ordering handles our rush hours perfectly. We serve 3x more customers now without adding staff.',
      author: 'Sneha Kulkarni',
      business: 'Chitale Bandhu Modern Kitchen',
    },
    localKeywords: [
      'Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Hinjewadi', 'Baner',
      'Aundh', 'Kothrud', 'Wakad', 'FC Road', 'JM Road', 'Shivaji Nagar',
      'Camp', 'Hadapsar', 'Magarpatta', 'Kharadi', 'Pimpri-Chinchwad',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Pune",
    "description": "Best restaurant POS software for Pune restaurants with Marathi language support, GST billing, and delivery integration.",
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
      "name": "Pune",
      "containedInPlace": {
        "@type": "State",
        "name": "Maharashtra"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Pune, offering GST-compliant billing for Maharashtra, Swiggy and Zomato integration, and AI voice ordering in Marathi. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Pune restaurants. Orders from Koregaon Park, Hinjewadi, Baner, and FC Road flow automatically into your POS, reducing errors."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Pune restaurants, including GST billing, QR menus, and delivery integration. Perfect for IT park lunch delivery and college crowd quick-service. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Marathi voice ordering in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Marathi and English, ideal for Pune restaurants. Staff can take orders hands-free in Marathi during peak lunch hours at IT parks."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Pune restaurants. No credit card required. Get full access to Marathi voice ordering, GST billing, and multi-outlet management for growing chains."
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
