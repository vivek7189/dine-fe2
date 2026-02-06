import DehradunPOSClient from './DehradunPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Dehradun | Cafe & Restaurant Billing | DineOpen',
  description: 'Best restaurant POS for Dehradun. Perfect for cafes, restaurants, bakeries & cloud kitchens. Student-friendly pricing, delivery integration for ISBT & Rajpur Road area. ₹999/month.',
  keywords: 'restaurant POS Dehradun, cafe billing Dehradun, restaurant software Uttarakhand, Dehradun cafe POS, Rajpur Road restaurant, cloud kitchen Dehradun, bakery billing software',
  openGraph: {
    title: 'Restaurant POS Software Dehradun | Cafe Billing | DineOpen',
    description: 'POS for Dehradun cafes and restaurants. Student-friendly, delivery integration, affordable pricing.',
    url: 'https://www.dineopen.com/pos/dehradun',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/dehradun' },
};

export default function DehradunPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Dehradun",
    "description": "Restaurant POS for Dehradun cafes, restaurants, and food businesses in Uttarakhand capital.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Dehradun" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <DehradunPOSClient />
    </>
  );
}
