import FoodCostCalculatorClient from './FoodCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Food Cost Calculator [Free, No Login] — Instant Results | DineOpen',
  description: 'Free restaurant food cost calculator — calculate food cost %, profit margins & ideal menu pricing in seconds. No login, no signup. Used by 5000+ restaurant owners to optimize menu prices and reduce waste.',
  keywords: 'restaurant food cost calculator, restaurant food cost calculator free, restaurant food price calculator, restaurant menu price calculator, food cost calculator, food cost percentage calculator, restaurant profit calculator, menu costing tool free, food cost formula, restaurant pricing calculator, food cost calculator online',
  openGraph: {
    title: 'Restaurant Food Cost Calculator [Free] — Instant Profit Margins | DineOpen',
    description: 'Calculate food cost %, profit margins & ideal menu pricing in seconds. Free, no login required.',
    url: 'https://www.dineopen.com/tools/food-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Food Cost Calculator [Free, No Login] | DineOpen',
    description: 'Calculate food cost % and ideal menu pricing instantly. No signup needed.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/food-cost-calculator',
  },
};

export default function FoodCostCalculatorPage() {
  return <FoodCostCalculatorClient />;
}
