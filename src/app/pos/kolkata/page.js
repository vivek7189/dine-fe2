import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Kolkata | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Kolkata. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 350+ Kolkata restaurants. Start free trial.',
  keywords: 'restaurant POS Kolkata, billing software Kolkata, restaurant software West Bengal, GST billing Kolkata, cloud POS Kolkata, QR menu Kolkata, sweet shop POS, restaurant management Kolkata',
  openGraph: {
    title: 'Best Restaurant POS Software in Kolkata | DineOpen',
    description: 'AI-powered restaurant POS for Kolkata. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/kolkata',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/kolkata',
  },
};

export default function KolkataPOSPage() {
  const cityData = {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '350+',
    highlights: [
      'Bengali language voice ordering support',
      'GST-compliant billing for West Bengal',
      'Swiggy & Zomato integration for Park Street',
      'Sweet shop (Mishti) inventory management',
      'Durga Puja rush hour handling',
      'Roll & street food quick billing',
    ],
    testimonial: {
      quote: 'During Durga Puja, our sweet shop gets 10x orders. DineOpen handled everything smoothly - billing, inventory alerts, and delivery coordination. Essential for Kolkata businesses.',
      author: 'Arindam Chatterjee',
      business: 'Balaram Mullick & Radharaman Mullick',
    },
    localKeywords: [
      'Park Street', 'Salt Lake', 'New Town', 'Ballygunge', 'Gariahat',
      'Howrah', 'Esplanade', 'College Street', 'Behala', 'Jadavpur',
      'Alipore', 'Rashbehari', 'Tollygunge', 'Lake Town', 'Dum Dum', 'Rajarhat',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Kolkata",
    "description": "Best restaurant POS software for Kolkata restaurants with Bengali language support, GST billing, and delivery integration.",
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
      "name": "Kolkata",
      "containedInPlace": {
        "@type": "State",
        "name": "West Bengal"
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Kolkata, offering GST-compliant billing for West Bengal, Swiggy and Zomato integration, and AI voice ordering in Bengali. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Kolkata restaurants. Orders from Park Street, Salt Lake, New Town, and Ballygunge flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Kolkata restaurants, including GST billing, QR menus, and delivery integration. Perfect for sweet shops and roll counters. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Bengali voice ordering in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Bengali and English, ideal for Kolkata restaurants and sweet shops. Staff can manage mishti inventory and take orders hands-free during Durga Puja rushes."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Kolkata restaurants and sweet shops. No credit card required. Get full access to Bengali language support, GST billing, and delivery integrations."
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
