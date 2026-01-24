import MenuPriceCalculatorClient from './MenuPriceCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Menu Price Calculator for Restaurants | DineOpen',
  description: 'Free menu pricing calculator. Find the ideal selling price for your dishes based on food cost, labor, overheads. No login required.',
  keywords: 'menu price calculator, restaurant pricing calculator, dish pricing tool, menu costing calculator, restaurant menu pricing free',
  openGraph: {
    title: 'Free Menu Price Calculator for Restaurants | DineOpen',
    description: 'Calculate ideal menu prices based on food cost and profit targets. Free tool for restaurants.',
    url: 'https://www.dineopen.com/tools/menu-price-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/menu-price-calculator',
  },
};

export default function MenuPriceCalculatorPage() {
  return <MenuPriceCalculatorClient />;
}
