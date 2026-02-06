import NoidaPOSClient from './NoidaPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Noida | Cloud Kitchen & Cafe Billing | DineOpen',
  description: 'Best restaurant POS for Noida & Greater Noida. Perfect for cloud kitchens, corporate cafeterias, malls, and IT park restaurants. Delivery-first features, Swiggy/Zomato integration. ₹999/month.',
  keywords: 'restaurant POS Noida, cloud kitchen software Noida, Greater Noida restaurant billing, IT park cafe POS, corporate cafeteria software, mall food court POS, Noida restaurant management',
  openGraph: {
    title: 'Restaurant POS Software Noida | Cloud Kitchen & Cafe | DineOpen',
    description: 'POS for Noida restaurants, cloud kitchens, IT parks. Delivery integration, corporate billing.',
    url: 'https://www.dineopen.com/pos/noida',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/noida' },
};

export default function NoidaPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Noida",
    "description": "Restaurant POS for Noida's cloud kitchens, corporate cafes, and modern restaurants.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Noida" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <NoidaPOSClient />
    </>
  );
}
