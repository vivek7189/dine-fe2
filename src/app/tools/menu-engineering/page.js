import MenuEngineeringClient from './MenuEngineeringClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Menu Engineering Matrix Calculator | Stars Puzzles Dogs | DineOpen',
  description: 'Free menu engineering tool. Categorize menu items into Stars, Puzzles, Plowhorses, and Dogs. Optimize your menu for maximum profit.',
  keywords: 'menu engineering, menu matrix, menu analysis, stars puzzles plowhorses dogs, menu optimization, restaurant menu profit',
  openGraph: {
    title: 'Menu Engineering Matrix Calculator | DineOpen',
    description: 'Analyze and optimize your menu using the classic menu engineering matrix.',
    url: 'https://www.dineopen.com/tools/menu-engineering',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/menu-engineering' },
};

export default function MenuEngineeringPage() {
  return <MenuEngineeringClient />;
}
