import AgraPOSClient from './AgraPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Agra | Taj Mahal Area & Tourist Restaurant | DineOpen',
  description: 'Best restaurant POS for Agra. Perfect for Taj Mahal area restaurants, rooftop cafes, tourist dining. Multi-currency, multi-language menus, tour group billing. ₹999/month.',
  keywords: 'restaurant POS Agra, Taj Mahal restaurant software, tourist restaurant billing, Agra cafe POS, rooftop restaurant software, petha shop billing, Agra hotel restaurant',
  openGraph: {
    title: 'Restaurant POS Software Agra | Tourist Restaurant Billing | DineOpen',
    description: 'POS for Agra tourist restaurants. Multi-language menus, tour group billing, Taj view cafes.',
    url: 'https://www.dineopen.com/pos/agra',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/agra' },
};

export default function AgraPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Agra",
    "description": "Restaurant POS for Agra's tourist restaurants, Taj Mahal area cafes, and hospitality businesses.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Agra" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <AgraPOSClient />
    </>
  );
}
