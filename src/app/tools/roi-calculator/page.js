import ROICalculatorClient from './ROICalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS ROI Calculator | Calculate Your Savings | DineOpen',
  description: 'Free ROI calculator for restaurant POS systems. Calculate how much you can save by switching to DineOpen. Compare transaction fees, monthly costs, and hidden charges.',
  keywords: 'restaurant POS ROI calculator, POS savings calculator, restaurant software cost calculator, compare POS costs, Square fees calculator, Toast fees calculator, restaurant technology ROI',
  openGraph: {
    title: 'Restaurant POS ROI Calculator | DineOpen',
    description: 'Calculate how much you can save by switching to DineOpen. Free ROI calculator for restaurants.',
    url: 'https://www.dineopen.com/tools/roi-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/roi-calculator',
  },
};

export default function ROICalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Restaurant POS ROI Calculator",
    "description": "Free calculator to determine your return on investment when switching restaurant POS systems.",
    "url": "https://www.dineopen.com/tools/roi-calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ROICalculatorClient />
    </>
  );
}
