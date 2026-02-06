import LiquorCostClient from './LiquorCostClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Liquor Pour Cost Calculator | Bar Drink Costing | DineOpen',
  description: 'Free pour cost calculator for bars and restaurants. Calculate drink costs, pour sizes, and profit margins for cocktails, beer, and wine.',
  keywords: 'liquor pour cost calculator, bar drink cost, cocktail costing, pour cost percentage, bar profit margin, drink pricing calculator',
  openGraph: {
    title: 'Liquor Pour Cost Calculator | Bar Costing | DineOpen',
    description: 'Calculate drink costs and pour margins for your bar or restaurant.',
    url: 'https://www.dineopen.com/tools/liquor-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/liquor-cost-calculator' },
};

export default function LiquorCostCalculatorPage() {
  return <LiquorCostClient />;
}
