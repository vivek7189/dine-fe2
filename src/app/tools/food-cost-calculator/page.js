import FoodCostCalculatorClient from './FoodCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Food Cost Calculator for Restaurants | DineOpen',
  description: 'Free food cost calculator for restaurants. Calculate food cost percentage, profit margins, and ideal pricing. No login required - use instantly.',
  keywords: 'food cost calculator, restaurant food cost, food cost percentage calculator, restaurant profit calculator, menu costing tool free',
  openGraph: {
    title: 'Free Food Cost Calculator for Restaurants | DineOpen',
    description: 'Calculate food cost percentage and profit margins instantly. Free tool for restaurant owners.',
    url: 'https://www.dineopen.com/tools/food-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/food-cost-calculator',
  },
};

export default function FoodCostCalculatorPage() {
  return <FoodCostCalculatorClient />;
}
