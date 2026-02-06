import VaranasiPOSClient from './VaranasiPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Varanasi | Ghat Cafe & Pure Veg Billing | DineOpen',
  description: 'Best restaurant POS for Varanasi. Perfect for ghat-view cafes, pure vegetarian restaurants, lassi shops & street food. Pilgrimage crowd management, sattvic menu tagging. ₹999/month.',
  keywords: 'restaurant POS Varanasi, Banaras cafe software, ghat restaurant billing, pure veg POS Varanasi, lassi shop billing, Kashi restaurant software, pilgrimage restaurant POS',
  openGraph: {
    title: 'Restaurant POS Software Varanasi | Ghat Cafe & Pure Veg | DineOpen',
    description: 'POS for Varanasi ghats restaurants. Pure veg tagging, tourist-friendly, pilgrimage rush management.',
    url: 'https://www.dineopen.com/pos/varanasi',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/varanasi' },
};

export default function VaranasiPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Varanasi",
    "description": "Restaurant POS for Varanasi's ghat cafes, pure veg restaurants, and pilgrimage food businesses.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Varanasi" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <VaranasiPOSClient />
    </>
  );
}
