import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Australia | Sydney, Melbourne | DineOpen',
  description: 'Top-rated restaurant POS software for Australia. Cloud-based billing, GST compliance, QR ordering, Uber Eats & Menulog integration. Perfect for Australian restaurants & cafes. AUD 39/month. Free trial.',
  keywords: 'restaurant POS Australia, POS system Sydney, restaurant software Melbourne, GST billing software Australia, cloud POS Australia, QR menu Australia, cafe POS Sydney, restaurant management Melbourne, hospitality POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Australia | DineOpen',
    description: 'Cloud-based restaurant POS for Australia with GST compliance and delivery integration.',
    url: 'https://www.dineopen.com/pos/australia',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/australia',
  },
};

export default function AustraliaPOSPage() {
  const cityData = {
    city: 'Australia',
    state: 'NSW, VIC & More',
    country: 'Australia',
    currency: 'AUD ',
    price: '39',
    restaurants: '70+',
    highlights: [
      'GST-compliant billing for Australia',
      'Uber Eats & Menulog integration',
      'Cafe culture optimized features',
      'Award wage & penalty rate tracking',
      'Multi-venue management for groups',
      'QR ordering with tap-to-pay support',
    ],
    testimonial: {
      quote: 'Melbourne cafe culture demands speed and style. DineOpen gives us both - beautiful QR menus our customers love and fast billing that keeps the queue moving.',
      author: 'Sarah Chen',
      business: 'Flat White Cafe, Melbourne',
    },
    localKeywords: [
      'Sydney CBD', 'Melbourne CBD', 'Brisbane', 'Perth', 'Adelaide',
      'Surry Hills', 'Fitzroy', 'Newtown', 'South Yarra', 'Bondi',
      'Gold Coast', 'Canberra', 'Parramatta', 'St Kilda', 'Fremantle', 'Fortitude Valley',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Australia",
    "description": "Best restaurant POS software for Australia with GST compliance and cafe-focused features.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "39",
      "priceCurrency": "AUD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
