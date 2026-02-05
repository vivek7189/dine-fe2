import BreakEvenCalculatorClient from './BreakEvenCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Break-Even Calculator | Know Your Numbers | DineOpen',
  description: 'Calculate how many customers or sales you need to break even. Free break-even analysis tool for restaurants, cafes, and food businesses. Plan your profitability.',
  keywords: 'break even calculator, restaurant break even, break even analysis, restaurant profitability calculator, how many customers to break even, restaurant business calculator, cafe break even point, food truck break even',
  openGraph: {
    title: 'Free Restaurant Break-Even Calculator | DineOpen',
    description: 'Calculate your break-even point. Know how many customers or sales you need to cover costs.',
    url: 'https://www.dineopen.com/tools/break-even-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/break-even-calculator',
  },
};

export default function BreakEvenCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Restaurant Break-Even Calculator",
    "description": "Calculate your restaurant's break-even point and plan for profitability.",
    "url": "https://www.dineopen.com/tools/break-even-calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BreakEvenCalculatorClient />
    </>
  );
}
