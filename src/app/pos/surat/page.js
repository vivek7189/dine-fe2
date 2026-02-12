import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Surat | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Surat restaurants. GST billing, Gujarati menus, Zomato/Swiggy integration, UPI payments. Perfect for Surti cuisine & diamond city restaurants.',
  keywords: 'restaurant POS Surat, billing software Surat, restaurant management Surat, GST billing software Surat, Gujarati POS Surat, Surti food POS, farsan shop billing Surat',
  openGraph: {
    title: 'Best Restaurant POS Software in Surat | DineOpen',
    description: 'Top-rated restaurant POS for Surat. GST billing, Gujarati support, delivery integration. Free trial.',
    url: 'https://www.dineopen.com/pos/surat',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/surat',
  },
};

export default function SuratPOSPage() {
  const cityData = {
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Gujarat',
      'Gujarati voice ordering & menu',
      'Zomato & Swiggy direct integration',
      'Perfect for Surti locho, ghari shops',
      'UPI, GPay, PhonePe payments',
      'Farsan shop weight-based billing',
    ],
    restaurants: '1,500+',
    testimonial: {
      quote: 'Our farsan shop handles 200+ customers during evening rush. DineOpen weight-based billing is perfect. Gujarati menu makes it easy for staff.',
      author: 'Nilesh Shah',
      business: 'Famous Farsan Mart, Surat',
    },
    localKeywords: ['Adajan', 'Vesu', 'Piplod', 'Athwa', 'Ring Road', 'Varachha', 'Katargam', 'Udhna'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Surat",
    "description": "Restaurant POS and billing software for Surat restaurants with GST billing and Gujarati support.",
    "url": "https://www.dineopen.com/pos/surat",
    "areaServed": { "@type": "City", "name": "Surat", "containedInPlace": { "@type": "State", "name": "Gujarat" } },
    "priceRange": "₹₹",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
