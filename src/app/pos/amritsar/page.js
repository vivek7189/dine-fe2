import AmritsarPOSClient from './AmritsarPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Amritsar | Dhaba & Punjabi Restaurant Billing | DineOpen',
  description: 'Best restaurant POS for Amritsar. Perfect for famous dhabas, Golden Temple area restaurants, kulcha shops & 24-hour eateries. High-volume Punjabi food billing. ₹999/month.',
  keywords: 'restaurant POS Amritsar, dhaba billing software, Punjabi restaurant POS, Golden Temple restaurant software, Amritsar food billing, kulcha shop POS, 24 hour restaurant software',
  openGraph: {
    title: 'Restaurant POS Software Amritsar | Dhaba & Punjabi Food | DineOpen',
    description: 'POS for Amritsar dhabas and restaurants. High-volume billing, 24/7 operations, pilgrim groups.',
    url: 'https://www.dineopen.com/pos/amritsar',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/amritsar' },
};

export default function AmritsarPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Amritsar",
    "description": "Restaurant POS for Amritsar's legendary dhabas, Punjabi restaurants, and pilgrim eateries.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Amritsar" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <AmritsarPOSClient />
    </>
  );
}
