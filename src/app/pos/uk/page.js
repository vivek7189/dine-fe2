import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System UK | AI Voice Ordering | EPOS Alternative | DineOpen',
  description: 'Best restaurant POS for UK restaurants. AI voice ordering, QR menus, VAT-compliant billing. Affordable alternative to Epos Now, Lightspeed. Free 30-day trial. From £8/month.',
  keywords: 'restaurant POS UK, restaurant EPOS system, UK restaurant software, Epos Now alternative, Lightspeed alternative, restaurant billing software UK, cafe POS UK, pub POS system, British restaurant POS, QR menu ordering UK, VAT billing restaurant',
  openGraph: {
    title: 'Restaurant POS System UK | AI Voice Ordering | DineOpen',
    description: 'AI-powered restaurant POS for UK restaurants. VAT-compliant, affordable. Free trial.',
    url: 'https://www.dineopen.com/pos/uk',
    siteName: 'DineOpen',
    locale: 'en_GB',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/uk',
  },
};

export default function UKPOSPage() {
  const cityData = {
    city: 'United Kingdom',
    state: '',
    country: 'UK',
    currency: '£',
    currencyCode: 'GBP',
    price: '8',
    highlights: [
      'VAT-compliant billing for UK restaurants',
      'AI voice ordering with UK accent support',
      'Deliveroo, Just Eat, Uber Eats ready',
      'Works on any device - iPad, Android, PC',
      'Month-to-month billing, no contracts',
    ],
    restaurants: '5,000+',
    testimonial: {
      quote: 'DineOpen transformed our gastropub in Shoreditch. The QR ordering reduced our wait times and the AI helps during busy weekend rushes.',
      author: 'James Williams',
      business: 'The Crafty Fox Pub',
    },
    localKeywords: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool', 'Bristol', 'Leeds', 'Glasgow', 'Cardiff', 'Brighton'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS UK",
    "description": "AI-powered restaurant EPOS system for UK restaurants with VAT-compliant billing.",
    "url": "https://www.dineopen.com/pos/uk",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "8",
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock"
    },
    "areaServed": { "@type": "Country", "name": "United Kingdom" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
