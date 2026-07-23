import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Ahmedabad | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Ahmedabad. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 300+ Ahmedabad restaurants. Start free trial.',
  keywords: 'restaurant POS Ahmedabad, billing software Ahmedabad, restaurant software Gujarat, GST billing Ahmedabad, cloud POS Ahmedabad, QR menu Ahmedabad, thali restaurant POS, restaurant management Ahmedabad',
  openGraph: {
    title: 'Best Restaurant POS Software in Ahmedabad | DineOpen',
    description: 'AI-powered restaurant POS for Ahmedabad. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/ahmedabad',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/ahmedabad',
  },
};

export default function AhmedabadPOSPage() {
  const cityData = {
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '300+',
    highlights: [
      'Gujarati language voice ordering support',
      'GST-compliant billing for Gujarat',
      'Swiggy & Zomato integration for SG Highway',
      'Unlimited thali item tracking',
      'Jain food filtering & labeling',
      'Fasting menu management features',
    ],
    testimonial: {
      quote: 'We run a busy Gujarati thali restaurant. DineOpen helps us track unlimited items per thali and manage our Jain/non-Jain menu perfectly. Customers love the QR ordering.',
      author: 'Hiren Patel',
      business: 'Gordhan Thal',
    },
    localKeywords: [
      'SG Highway', 'C.G. Road', 'Navrangpura', 'Prahlad Nagar', 'Satellite',
      'Vastrapur', 'Bodakdev', 'Thaltej', 'Maninagar', 'Ashram Road',
      'Law Garden', 'Ellis Bridge', 'Paldi', 'Gurukul', 'Chandkheda', 'Bopal',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Ahmedabad",
    "description": "Best restaurant POS software for Ahmedabad restaurants with Gujarati language support, GST billing, and delivery integration.",
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
      "name": "Ahmedabad",
      "containedInPlace": {
        "@type": "State",
        "name": "Gujarat"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Ahmedabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Ahmedabad, offering GST-compliant billing for Gujarat, Gujarati language voice ordering, Swiggy and Zomato integration, and Jain food filtering. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Ahmedabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Ahmedabad restaurants. Orders from SG Highway, C.G. Road, Prahlad Nagar, and Navrangpura flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Ahmedabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Ahmedabad restaurants, including GST billing, QR menus, Jain food labeling, and unlimited thali item tracking. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Gujarati voice ordering in Ahmedabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Gujarati and English, perfect for Ahmedabad's thali restaurants and farsan shops. It also includes fasting menu management features."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Ahmedabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Ahmedabad restaurants. No credit card required. Get full access to Gujarati language support, GST billing, and Jain/non-Jain menu management."
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
