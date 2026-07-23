import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Goa | Beach Shack & Cafe Billing | DineOpen',
  description: 'Top-rated restaurant POS software in Goa. AI-powered billing, GST compliance, QR code ordering. Perfect for beach shacks, cafes, bars & nightclubs. Multi-currency for tourists. Start free trial.',
  keywords: 'restaurant POS Goa, billing software Goa, beach shack POS, bar POS Goa, nightclub billing software, cafe POS Goa, tourist restaurant software, multi-currency POS, Goa restaurant management',
  openGraph: {
    title: 'Best Restaurant POS Software in Goa | DineOpen',
    description: 'AI-powered restaurant POS for Goa. Perfect for beach shacks, bars, cafes with multi-currency support.',
    url: 'https://www.dineopen.com/pos/goa',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/goa',
  },
};

export default function GoaPOSPage() {
  const cityData = {
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '300+',
    highlights: [
      'Multi-currency display (₹, $, €, £)',
      'Beach shack seasonal business support',
      'Bar & nightclub tab management',
      'Tourist-friendly QR menus in 10+ languages',
      'Seafood catch-of-the-day pricing',
      'Outdoor/beach WiFi-independent mode',
    ],
    testimonial: {
      quote: 'Running a beach shack in Goa means dealing with tourists from everywhere. DineOpen shows prices in their currency, works without WiFi on the beach, and handles our bar tabs perfectly.',
      author: 'Anthony Fernandes',
      business: 'Curlies Beach Shack, Anjuna',
    },
    localKeywords: [
      'Baga', 'Calangute', 'Anjuna', 'Vagator', 'Candolim', 'Panjim',
      'Margao', 'Mapusa', 'Palolem', 'Arambol', 'Morjim', 'Ashwem',
      'Colva', 'Benaulim', 'Vasco', 'Old Goa', 'Fontainhas', 'Tito\'s Lane',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Goa",
    "description": "Best restaurant POS software for Goa with beach shack support, multi-currency display, and bar management.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "State",
      "name": "Goa"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Goa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Goa, offering multi-currency display for tourists, beach shack seasonal support, bar and nightclub tab management, and WiFi-independent offline mode. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Goa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Goa restaurants. Orders from Baga, Calangute, Anjuna, Panjim, and Margao flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Goa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Goa restaurants, including GST billing, multi-currency display, bar tab management, and tourist-friendly QR menus in 10+ languages. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work offline on Goa beaches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen has a WiFi-independent offline mode perfect for Goa beach shacks and outdoor restaurants. All orders and billing continue working without internet, and data syncs automatically when back online."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Goa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Goa restaurants, beach shacks, and bars. No credit card required. Get full access to multi-currency display, bar management, and seasonal billing features."
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
