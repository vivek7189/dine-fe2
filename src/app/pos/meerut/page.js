import MeerutPOSClient from './MeerutPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Meerut | Industrial Canteen & Street Food | DineOpen',
  description: 'Best restaurant POS for Meerut. Perfect for factory canteens, street food vendors, sweet shops & catering. Industrial workforce billing, sports academy meals. ₹999/month.',
  keywords: 'restaurant POS Meerut, canteen billing software, street food POS Meerut, industrial canteen software, Meerut restaurant billing, sweet shop POS, catering software Meerut',
  openGraph: {
    title: 'Restaurant POS Software Meerut | Industrial Canteen & Street Food | DineOpen',
    description: 'POS for Meerut restaurants and canteens. Industrial billing, street food, catering support.',
    url: 'https://www.dineopen.com/pos/meerut',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/meerut' },
};

export default function MeerutPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Meerut",
    "description": "Restaurant POS for Meerut's industrial canteens, street food vendors, and catering businesses.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Meerut" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MeerutPOSClient />
    </>
  );
}
