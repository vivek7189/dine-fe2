import RecipeCostCalculatorClient from './RecipeCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Recipe Cost Calculator | Food Costing Tool | DineOpen',
  description: 'Free recipe cost calculator for restaurants. Calculate dish cost, food cost percentage, and ideal selling price. Add ingredients, set portions, get accurate costing.',
  keywords: 'recipe cost calculator, food costing calculator, dish cost calculator, restaurant recipe costing, menu pricing calculator, food cost percentage',
  openGraph: {
    title: 'Recipe Cost Calculator | Free Food Costing Tool | DineOpen',
    description: 'Calculate dish cost, food cost percentage, and ideal selling price for your restaurant menu.',
    url: 'https://www.dineopen.com/tools/recipe-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/recipe-cost-calculator' },
};

export default function RecipeCostCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Recipe Cost Calculator",
    "description": "Free tool to calculate recipe costs, food cost percentage, and ideal menu pricing for restaurants.",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <RecipeCostCalculatorClient />
    </>
  );
}
