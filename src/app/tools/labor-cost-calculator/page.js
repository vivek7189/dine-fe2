import LaborCostCalculatorClient from './LaborCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Labor Cost Calculator | Staff Scheduling | DineOpen',
  description: 'Calculate restaurant labor costs and labor cost percentage. Plan staffing schedules and optimize your payroll. Free calculator for restaurant owners.',
  keywords: 'labor cost calculator, restaurant labor cost, labor cost percentage, restaurant staffing calculator, payroll calculator restaurant, staff scheduling, restaurant employee costs, food service labor costs',
  openGraph: {
    title: 'Free Restaurant Labor Cost Calculator | DineOpen',
    description: 'Calculate labor costs and optimize your restaurant staffing. Free calculator.',
    url: 'https://www.dineopen.com/tools/labor-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/labor-cost-calculator',
  },
};

export default function LaborCostCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Restaurant Labor Cost Calculator",
    "description": "Calculate your restaurant's labor costs and labor cost percentage.",
    "url": "https://www.dineopen.com/tools/labor-cost-calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LaborCostCalculatorClient />
    </>
  );
}
