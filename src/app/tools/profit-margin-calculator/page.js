import ProfitMarginCalculatorClient from './ProfitMarginCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Food Cost & Profit Margin Calculator | Restaurant Pricing | DineOpen',
  description: 'Calculate food cost percentage, profit margins, and ideal menu prices. Free calculator for restaurants, cafes & food businesses. Optimize your menu pricing today.',
  keywords: 'food cost calculator, profit margin calculator, restaurant profit margin, menu pricing calculator, food cost percentage, restaurant markup calculator, how to price menu items, food business calculator, cafe profit calculator',
  openGraph: {
    title: 'Free Food Cost & Profit Margin Calculator | DineOpen',
    description: 'Calculate food cost percentage, profit margins, and ideal menu prices for your restaurant.',
    url: 'https://www.dineopen.com/tools/profit-margin-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/profit-margin-calculator',
  },
};

export default function ProfitMarginCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Restaurant Profit Margin Calculator",
    "description": "Free calculator to determine food costs, profit margins, and optimal menu pricing.",
    "url": "https://www.dineopen.com/tools/profit-margin-calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProfitMarginCalculatorClient />
    </>
  );
}
