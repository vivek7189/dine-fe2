import IndiaHubClient from './IndiaHubClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software India | GST Billing, FSSAI Compliant | DineOpen',
  description: 'Best restaurant POS software for Indian restaurants. GST-compliant billing, FSSAI compliance, Zomato/Swiggy integration, UPI payments, Hindi voice ordering. Trusted by 50,000+ restaurants across India.',
  keywords: 'restaurant POS India, billing software India, restaurant management India, GST billing software, FSSAI compliant POS, Zomato integration, Swiggy POS, QR menu India, restaurant billing India, cafe POS India, bar POS India, hotel POS India',
  openGraph: {
    title: 'Restaurant POS Software India | DineOpen',
    description: 'Best restaurant POS for India. GST billing, FSSAI compliance, Zomato/Swiggy integration, UPI payments. Free 7-day trial.',
    url: 'https://www.dineopen.com/india',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/og-india.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen Restaurant POS Software India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS Software India | DineOpen',
    description: 'Best restaurant POS for India with GST billing, FSSAI compliance, and delivery integration.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/india',
    languages: {
      'en-IN': 'https://www.dineopen.com/india',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function IndiaPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen India",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "description": "Restaurant POS and billing software for Indian restaurants with GST billing, FSSAI compliance, and Zomato/Swiggy integration.",
    "url": "https://www.dineopen.com/india",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "2500",
      "bestRating": "5"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <IndiaHubClient />
    </>
  );
}
