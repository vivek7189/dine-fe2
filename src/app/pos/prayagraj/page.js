import PrayagrajPOSClient from './PrayagrajPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Prayagraj | Sangam Pilgrim & Pure Veg Billing | DineOpen',
  description: 'Best restaurant POS for Prayagraj (Allahabad). Perfect for Sangam-area restaurants, pure veg eateries, student cafes. Kumbh Mela scale, pilgrim groups. ₹999/month.',
  keywords: 'restaurant POS Prayagraj, Allahabad restaurant software, Sangam area billing, pure veg POS Allahabad, Kumbh Mela restaurant software, pilgrim restaurant POS',
  openGraph: {
    title: 'Restaurant POS Software Prayagraj | Sangam & Pure Veg | DineOpen',
    description: 'POS for Prayagraj pilgrim restaurants. Kumbh scale, pure veg tagging, student-friendly.',
    url: 'https://www.dineopen.com/pos/prayagraj',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/prayagraj' },
};

export default function PrayagrajPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Prayagraj",
    "description": "Restaurant POS for Prayagraj's Sangam-area restaurants, pilgrim eateries, and student cafes.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Prayagraj" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PrayagrajPOSClient />
    </>
  );
}
