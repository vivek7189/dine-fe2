import PricingClient from './PricingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen Pricing | Restaurant POS from $9.99/month | Free Trial',
  description: 'DineOpen pricing plans starting at $9.99/month (₹300/month in India). AI voice ordering, QR menus, zero transaction fees. Compare Spark vs Blaze plans. Free 30-day trial.',
  keywords: 'DineOpen pricing, restaurant POS pricing, cheap restaurant POS, affordable restaurant software, restaurant billing software price, POS system cost, restaurant management software pricing, DineOpen cost, free restaurant POS trial',
  openGraph: {
    title: 'DineOpen Pricing | Restaurant POS from $9.99/month',
    description: 'Affordable restaurant POS pricing. AI features, zero transaction fees. Free 30-day trial.',
    url: 'https://www.dineopen.com/pricing',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen Pricing | Restaurant POS from $9.99/month',
    description: 'Affordable restaurant POS with AI. Zero transaction fees. Free 30-day trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pricing',
  },
};

export default function PricingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DineOpen Restaurant POS",
    "description": "AI-powered restaurant POS and billing software with voice ordering, QR menus, and zero transaction fees.",
    "brand": { "@type": "Brand", "name": "DineOpen" },
    "offers": [
      {
        "@type": "Offer",
        "name": "Spark Plan",
        "price": "9.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Blaze Plan",
        "price": "89",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Spark Plan (India)",
        "price": "300",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PricingClient />
    </>
  );
}
