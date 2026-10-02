import PricingClient from './PricingClient';
import { PRICING_FAQS } from './faqs';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen Pricing: Restaurant POS from $20/month',
  description: 'AI-powered restaurant POS with KOT printing, QR ordering and 0% transaction fees. Starter $20, Growth $50, Pro $99 a month. Local prices for UK, UAE and Saudi. 7-day free trial.',
  keywords: 'DineOpen pricing, restaurant POS pricing, cheap restaurant POS, AI restaurant POS, affordable restaurant software, restaurant billing software price, POS system cost, Petpooja alternative, Toast alternative, Square alternative, free restaurant POS trial',
  openGraph: {
    title: 'DineOpen Pricing: Restaurant POS from $20/month',
    description: 'Starter $20, Growth $50, Pro $99 a month. 0% transaction fees. 7-day free trial, no credit card.',
    url: 'https://www.dineopen.com/pricing',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen Pricing: Restaurant POS from $20/month',
    description: 'Starter $20, Growth $50, Pro $99 a month. 0% transaction fees. 7-day free trial, no credit card.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pricing',
  },
};

export default function PricingPage() {
  // Offers mirror the monthly prices shown on the page (India pricing is quoted, not listed).
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DineOpen Restaurant POS",
    "description": "AI-powered restaurant POS and billing software with KOT printing, QR ordering, voice ordering and zero transaction fees. Plans from $20/month.",
    "image": "https://www.dineopen.com/favicon.png",
    "brand": { "@type": "Brand", "name": "DineOpen" },
    "offers": [
      { "@type": "Offer", "name": "Starter Plan (USD)", "price": "20", "priceCurrency": "USD", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Starter Plan (GBP)", "price": "16", "priceCurrency": "GBP", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Starter Plan (AED)", "price": "75", "priceCurrency": "AED", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Starter Plan (SAR)", "price": "75", "priceCurrency": "SAR", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Growth Plan (USD)", "price": "50", "priceCurrency": "USD", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Growth Plan (GBP)", "price": "40", "priceCurrency": "GBP", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Growth Plan (AED)", "price": "185", "priceCurrency": "AED", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Growth Plan (SAR)", "price": "190", "priceCurrency": "SAR", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Pro Plan (USD)", "price": "99", "priceCurrency": "USD", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Pro Plan (GBP)", "price": "79", "priceCurrency": "GBP", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Pro Plan (AED)", "price": "365", "priceCurrency": "AED", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" },
      { "@type": "Offer", "name": "Pro Plan (SAR)", "price": "370", "priceCurrency": "SAR", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "url": "https://www.dineopen.com/pricing" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": PRICING_FAQS.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PricingClient />
    </>
  );
}
