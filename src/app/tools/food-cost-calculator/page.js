import FoodCostCalculatorClient from './FoodCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Food Cost Calculator Free | Menu Price Calculator | DineOpen',
  description: 'Free restaurant food cost calculator. Calculate food cost percentage, profit margins, and ideal menu pricing. Restaurant food price calculator and menu price calculator — no login required, use instantly.',
  keywords: 'restaurant food cost calculator, restaurant food price calculator, restaurant menu price calculator, food cost calculator, food cost percentage calculator, restaurant profit calculator, menu costing tool free, food cost formula, restaurant pricing calculator',
  openGraph: {
    title: 'Restaurant Food Cost Calculator Free | Menu Price Calculator | DineOpen',
    description: 'Free restaurant food cost calculator. Calculate food cost percentage, profit margins, and ideal menu pricing instantly.',
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
