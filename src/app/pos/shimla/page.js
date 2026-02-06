import ShimlaPOSClient from './ShimlaPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Shimla | Mall Road Cafe & Hotel Restaurant | DineOpen',
  description: 'Best restaurant POS for Shimla. Perfect for Mall Road cafes, heritage restaurants, hotel dining & resort outlets. Tourist rush management, seasonal billing. ₹999/month.',
  keywords: 'restaurant POS Shimla, Mall Road cafe software, hill station restaurant billing, hotel POS Shimla, tourist cafe software, heritage restaurant POS Himachal',
  openGraph: {
    title: 'Restaurant POS Software Shimla | Mall Road Cafe & Hotel | DineOpen',
    description: 'POS for Shimla cafes and hotels. Tourist-friendly, heritage cafe ready, seasonal management.',
    url: 'https://www.dineopen.com/pos/shimla',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/shimla' },
};

export default function ShimlaPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Shimla",
    "description": "Restaurant POS for Shimla's Mall Road cafes, heritage restaurants, and hotel dining.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Shimla" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ShimlaPOSClient />
    </>
  );
}
