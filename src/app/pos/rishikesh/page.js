import RishikeshPOSClient from './RishikeshPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Rishikesh | Yoga Cafe & Vegan Restaurant Billing | DineOpen',
  description: 'Best restaurant POS for Rishikesh. Perfect for yoga cafes, vegan restaurants, rooftop cafes & ashram kitchens. Multi-currency for international tourists, organic menu tagging. ₹999/month.',
  keywords: 'restaurant POS Rishikesh, yoga cafe software, vegan restaurant POS, organic cafe billing, Rishikesh cafe POS, tourist restaurant software, rooftop cafe billing, ashram kitchen software',
  openGraph: {
    title: 'Restaurant POS Rishikesh | Yoga Cafe & Vegan Billing | DineOpen',
    description: 'POS for Rishikesh yoga capital. Vegan tagging, multi-currency, tourist-friendly QR menus.',
    url: 'https://www.dineopen.com/pos/rishikesh',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/rishikesh',
  },
};

export default function RishikeshPOSPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Rishikesh",
    "description": "Restaurant POS for Rishikesh yoga cafes, vegan restaurants, and tourist-facing food businesses.",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Rishikesh" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <RishikeshPOSClient />
    </>
  );
}
