import InventoryParClient from './InventoryParClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Inventory Par Level Calculator | Restaurant Stock Management | DineOpen',
  description: 'Free par level calculator for restaurants. Calculate optimal stock levels based on usage, lead time, and safety stock. Never run out or overstock.',
  keywords: 'par level calculator, restaurant inventory par, optimal stock level, inventory management calculator, restaurant stock calculator',
  openGraph: {
    title: 'Inventory Par Level Calculator | DineOpen',
    description: 'Calculate optimal stock levels for your restaurant. Free par level calculator.',
    url: 'https://www.dineopen.com/tools/inventory-par-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/inventory-par-calculator' },
};

export default function InventoryParPage() {
  return <InventoryParClient />;
}
