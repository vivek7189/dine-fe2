import SaharanpurPOSClient from './SaharanpurPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Saharanpur | Sweet Shop & Canteen Billing | DineOpen',
  description: 'Best restaurant POS for Saharanpur. Perfect for sweet shops, industrial canteens, market restaurants & highway dhabas. Quick billing, inventory management. ₹999/month.',
  keywords: 'restaurant POS Saharanpur, sweet shop billing software, canteen POS Saharanpur, dhaba billing software, Saharanpur restaurant software, namkeen shop POS',
  openGraph: {
    title: 'Restaurant POS Software Saharanpur | Sweet Shop & Canteen | DineOpen',
    description: 'POS for Saharanpur restaurants and sweet shops. Quick billing, canteen management, highway dhaba support.',
    url: 'https://www.dineopen.com/pos/saharanpur',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/saharanpur' },
};

export default function SaharanpurPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Saharanpur",
    "description": "Restaurant POS for Saharanpur's sweet shops, restaurants, and industrial canteens.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Saharanpur" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <SaharanpurPOSClient />
    </>
  );
}
