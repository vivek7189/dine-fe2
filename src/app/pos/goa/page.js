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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
