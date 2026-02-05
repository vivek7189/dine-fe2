import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System USA | AI Voice Ordering | Square Alternative | DineOpen',
  description: 'Best restaurant POS for US restaurants. AI voice ordering, QR menus, zero transaction fees (save vs Square 2.6%). Works with Toast, Clover hardware. Free 30-day trial.',
  keywords: 'restaurant POS USA, restaurant POS system America, US restaurant software, Square alternative USA, Toast alternative, restaurant billing software USA, cafe POS USA, bar POS system, American restaurant POS, QR menu ordering USA',
  openGraph: {
    title: 'Restaurant POS System USA | AI Voice Ordering | DineOpen',
    description: 'AI-powered restaurant POS for US restaurants. Zero transaction fees, Square alternative. Free trial.',
    url: 'https://www.dineopen.com/pos/usa',
    siteName: 'DineOpen',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/usa',
  },
};

export default function USAPOSPage() {
  const cityData = {
    city: 'United States',
    state: '',
    country: 'USA',
    currency: '$',
    currencyCode: 'USD',
    price: '10',
    highlights: [
      'Zero transaction fees (save vs Square 2.6%)',
      'AI voice ordering in English & Spanish',
      'Works on any device - no hardware lock-in',
      'DoorDash, Uber Eats, Grubhub ready',
      'Month-to-month billing, no contracts',
    ],
    restaurants: '10,000+',
    testimonial: {
      quote: 'We switched from Square and saved over $5,000 in transaction fees last year. The AI voice ordering has sped up our drive-thru by 30%.',
      author: 'Mike Johnson',
      business: 'Burger Barn',
    },
    localKeywords: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Seattle', 'Austin', 'Denver', 'Boston'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS USA",
    "description": "AI-powered restaurant POS system for US restaurants with zero transaction fees.",
    "url": "https://www.dineopen.com/pos/usa",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "10",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "areaServed": { "@type": "Country", "name": "United States" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
