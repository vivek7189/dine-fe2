import HaridwarPOSClient from './HaridwarPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Haridwar | Pure Veg Billing | Ashram & Dharamshala | DineOpen',
  description: 'Best restaurant POS for Haridwar. Perfect for pure vegetarian restaurants, ashram bhojanalayas, dharamshala canteens & pilgrimage cafes. No onion-garlic tagging, sattvic menu support. ₹999/month.',
  keywords: 'restaurant POS Haridwar, vegetarian restaurant software, ashram billing software, dharamshala POS, Haridwar cafe billing, pure veg POS, sattvic restaurant software, pilgrimage restaurant POS, bhojanshala billing',
  openGraph: {
    title: 'Restaurant POS Software Haridwar | Pure Veg & Ashram Billing | DineOpen',
    description: 'POS for Haridwar holy city restaurants. Pure veg tagging, ashram bhojanshala support, pilgrimage crowd management.',
    url: 'https://www.dineopen.com/pos/haridwar',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/haridwar',
  },
};

export default function HaridwarPOSPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Haridwar",
    "description": "Restaurant POS for Haridwar's pure vegetarian restaurants, ashram bhojanalayas, and pilgrimage cafes with sattvic menu support.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR"
    },
    "areaServed": {
      "@type": "City",
      "name": "Haridwar",
      "containedInPlace": { "@type": "State", "name": "Uttarakhand" }
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HaridwarPOSClient />
    </>
  );
}
