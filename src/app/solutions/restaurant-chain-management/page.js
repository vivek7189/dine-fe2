import RestaurantChainManagementClient from './RestaurantChainManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Chain Management Software | DineOpen',
  description: 'Manage 2 to 200+ restaurant outlets from one dashboard. Centralized menus, reporting, staff access, and analytics for growing restaurant chains with DineOpen.',
  keywords: 'restaurant chain management, multi-outlet POS, centralized restaurant software, chain restaurant analytics, DineOpen, multi-location management',
  openGraph: {
    title: 'Restaurant Chain Management Software | DineOpen',
    description: 'Manage 2 to 200+ restaurant outlets from one dashboard. Centralized menus, reporting, staff access, and analytics for growing restaurant chains with DineOpen.',
    url: 'https://www.dineopen.com/solutions/restaurant-chain-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Chain Management Software | DineOpen',
    description: 'Manage 2 to 200+ restaurant outlets from one dashboard. Centralized menus, reporting, staff access, and analytics for growing restaurant chains with DineOpen.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/restaurant-chain-management',
  },
};

export default function RestaurantChainManagementPage() {
  return <RestaurantChainManagementClient />;
}
