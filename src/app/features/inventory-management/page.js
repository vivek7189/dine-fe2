import InventoryManagementClient from './InventoryManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Inventory Management Software | Stock Control | DineOpen',
  description: 'Complete inventory management for restaurants. Track stock levels, set par levels, reduce waste, manage recipes, and automate purchase orders.',
  keywords: 'restaurant inventory management, stock control software, restaurant stock management, food inventory system, kitchen inventory software, recipe management',
  openGraph: {
    title: 'Restaurant Inventory Management | DineOpen',
    description: 'Track stock, reduce waste, and automate inventory with DineOpen.',
    url: 'https://www.dineopen.com/features/inventory-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/features/inventory-management' },
};

export default function InventoryManagementPage() {
  return <InventoryManagementClient />;
}
