import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Singapore | Cloud POS | DineOpen',
  description: 'Top-rated restaurant POS software for Singapore. GST-compliant billing, QR ordering, GrabFood & Foodpanda integration. Perfect for hawker stalls, cafes & restaurants. SGD 49/month. Free trial.',
  keywords: 'restaurant POS Singapore, hawker stall POS, cafe billing Singapore, GST POS Singapore, cloud POS Singapore, QR ordering Singapore, GrabFood integration, restaurant software Singapore, kopitiam POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Singapore | DineOpen',
    description: 'Cloud-based restaurant POS for Singapore with GST compliance, hawker stall support, and delivery integration.',
    url: 'https://www.dineopen.com/pos/singapore',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/singapore',
  },
};

export default function SingaporePOSPage() {
  const cityData = {
    city: 'Singapore',
    state: 'Singapore',
    country: 'Singapore',
    currency: 'SGD ',
    price: '49',
    restaurants: '100+',
    highlights: [
      'GST-compliant billing for Singapore',
      'English, Mandarin, Malay, Tamil support',
      'GrabFood & Foodpanda integration',
      'Hawker stall & kopitiam optimized',
      'QR ordering with PayNow/NETS support',
      'Multi-outlet chain management',
    ],
    testimonial: {
      quote: 'We started with one hawker stall and now have 5 outlets. DineOpen scaled with us perfectly. The multi-outlet dashboard saves hours of work and GST filing is automatic.',
      author: 'David Tan',
      business: 'Lucky Chicken Rice Chain',
    },
    localKeywords: [
      'Orchard Road', 'Marina Bay', 'Clarke Quay', 'Chinatown', 'Little India',
      'Bugis', 'Tanjong Pagar', 'Holland Village', 'Tiong Bahru', 'Katong',
      'Jurong', 'Tampines', 'Woodlands', 'Sentosa', 'Raffles Place', 'Novena',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Singapore",
    "description": "Best restaurant POS software for Singapore with GST compliance, hawker support, and delivery integration.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "49",
      "priceCurrency": "SGD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Singapore"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
