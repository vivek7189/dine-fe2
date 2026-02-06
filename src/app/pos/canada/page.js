import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Canada | Toronto, Vancouver | DineOpen',
  description: 'Top-rated restaurant POS software for Canada. Cloud-based billing, HST/GST compliance, QR ordering, Skip & DoorDash integration. Perfect for Canadian restaurants. CAD 39/month. Free trial.',
  keywords: 'restaurant POS Canada, POS system Toronto, restaurant software Vancouver, HST billing software, cloud POS Canada, QR menu Canada, Indian restaurant POS Toronto, cafe billing Vancouver, restaurant management Canada',
  openGraph: {
    title: 'Best Restaurant POS Software in Canada | DineOpen',
    description: 'Cloud-based restaurant POS for Canada with HST/GST compliance and delivery integration.',
    url: 'https://www.dineopen.com/pos/canada',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/canada',
  },
};

export default function CanadaPOSPage() {
  const cityData = {
    city: 'Canada',
    state: 'Ontario, BC & More',
    country: 'Canada',
    currency: 'CAD ',
    price: '39',
    restaurants: '80+',
    highlights: [
      'HST/GST/PST compliant billing',
      'English & French language support',
      'Skip The Dishes & DoorDash integration',
      'Tip pooling & gratuity management',
      'Multi-province tax configuration',
      'Winter-ready offline mode',
    ],
    testimonial: {
      quote: 'As an Indian restaurant in Toronto, we needed a POS that understands our cuisine. DineOpen handles our complex menu perfectly and the Skip integration doubled our delivery orders.',
      author: 'Harpreet Kaur',
      business: 'Punjab Grill, Toronto',
    },
    localKeywords: [
      'Toronto Downtown', 'Brampton', 'Mississauga', 'Vancouver Downtown', 'Surrey',
      'Calgary', 'Edmonton', 'Montreal', 'Ottawa', 'Winnipeg',
      'Scarborough', 'North York', 'Richmond', 'Burnaby', 'Markham', 'Vaughan',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Canada",
    "description": "Best restaurant POS software for Canada with HST/GST compliance and delivery platform integration.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "39",
      "priceCurrency": "CAD",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
