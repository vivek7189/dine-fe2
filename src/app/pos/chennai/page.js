import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Chennai | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Chennai. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 500+ Chennai restaurants. Start free trial.',
  keywords: 'restaurant POS Chennai, billing software Chennai, restaurant software Tamil Nadu, GST billing Chennai, cloud POS Chennai, QR menu Chennai, restaurant management Chennai, cafe POS Chennai',
  openGraph: {
    title: 'Best Restaurant POS Software in Chennai | DineOpen',
    description: 'AI-powered restaurant POS for Chennai. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/chennai',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/chennai',
  },
};

export default function ChennaiPOSPage() {
  const cityData = {
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '500+',
    highlights: [
      'Tamil language support for voice ordering',
      'GST-compliant billing for Tamil Nadu',
      'Swiggy & Zomato integration for Marina Beach area',
      'Multi-cuisine support for Chettinad restaurants',
      'Beach-side QR ordering for outdoor venues',
      'South Indian thali management features',
    ],
    testimonial: {
      quote: 'DineOpen understands Chennai restaurants. The Tamil voice ordering feature is amazing - our staff picked it up in one day. GST billing is automatic and accurate.',
      author: 'Karthik Rajan',
      business: 'Namma Saapadu Restaurant',
    },
    localKeywords: [
      'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR', 'ECR',
      'Mylapore', 'Besant Nagar', 'Porur', 'Vadapalani', 'Guindy',
      'Mount Road', 'Egmore', 'Nungambakkam', 'Alwarpet', 'Thiruvanmiyur',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Chennai",
    "description": "Best restaurant POS software for Chennai restaurants with Tamil language support, GST billing, and delivery integration.",
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
      "name": "Chennai",
      "containedInPlace": {
        "@type": "State",
        "name": "Tamil Nadu"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Chennai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Chennai, offering GST-compliant billing for Tamil Nadu, Swiggy and Zomato integration, and AI voice ordering in Tamil. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Chennai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Chennai restaurants. Orders from T. Nagar, Anna Nagar, OMR, and ECR flow automatically into your POS, reducing errors."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Chennai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Chennai restaurants, including GST billing, QR menus, and delivery integration. All prices are GST-inclusive with no hidden charges."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Tamil voice ordering in Chennai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Tamil and English, perfect for Chennai restaurants. Staff can take orders in Tamil, making it ideal for South Indian thali and Chettinad restaurants."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Chennai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Chennai restaurants. No credit card required. Get full access to Tamil voice ordering, GST billing, and Swiggy/Zomato integration."
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
