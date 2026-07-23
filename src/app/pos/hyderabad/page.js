import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Hyderabad | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Hyderabad. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 600+ Hyderabad restaurants. Start free trial.',
  keywords: 'restaurant POS Hyderabad, billing software Hyderabad, restaurant software Telangana, GST billing Hyderabad, cloud POS Hyderabad, QR menu Hyderabad, biryani restaurant POS, restaurant management Hyderabad',
  openGraph: {
    title: 'Best Restaurant POS Software in Hyderabad | DineOpen',
    description: 'AI-powered restaurant POS for Hyderabad. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/hyderabad',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/hyderabad',
  },
};

export default function HyderabadPOSPage() {
  const cityData = {
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '600+',
    highlights: [
      'Telugu & Urdu language voice ordering',
      'GST-compliant billing for Telangana',
      'Swiggy & Zomato integration for HITEC City',
      'Biryani restaurant specialized features',
      'High-volume order management for Ramadan',
      'Irani cafe billing optimization',
    ],
    testimonial: {
      quote: 'Running a busy biryani restaurant in Hyderabad means handling 500+ orders daily. DineOpen handles the rush effortlessly. The voice ordering in Telugu is a game-changer for us.',
      author: 'Mohammed Ismail',
      business: 'Paradise Biryani Express',
    },
    localKeywords: [
      'Banjara Hills', 'Jubilee Hills', 'HITEC City', 'Madhapur', 'Gachibowli',
      'Kukatpally', 'Secunderabad', 'Ameerpet', 'Kondapur', 'Begumpet',
      'Somajiguda', 'Charminar', 'Tolichowki', 'Miyapur', 'LB Nagar', 'Dilsukhnagar',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Hyderabad",
    "description": "Best restaurant POS software for Hyderabad restaurants with Telugu/Urdu language support, GST billing, and delivery integration.",
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
      "name": "Hyderabad",
      "containedInPlace": {
        "@type": "State",
        "name": "Telangana"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Hyderabad, offering GST-compliant billing for Telangana, Swiggy and Zomato integration, and AI voice ordering in Telugu and Urdu. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Hyderabad restaurants. Orders from HITEC City, Banjara Hills, Jubilee Hills, and Madhapur flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Hyderabad restaurants, including GST billing, QR menus, and delivery integration. Perfect for biryani restaurants and Irani cafes. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Telugu voice ordering in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Telugu, Urdu, and English, ideal for Hyderabad's diverse restaurant scene. Staff can take orders hands-free during high-volume Ramadan and festival rushes."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Hyderabad restaurants. No credit card required. Get full access to GST billing, delivery integration, and biryani restaurant specialized features."
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
