import DeliveryManagementClient from './DeliveryManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Delivery Order Management Software | DineOpen',
  description: 'Manage Zomato, Swiggy, and direct delivery orders from one dashboard. Track riders, route to kitchen, and analyze platform revenue with DineOpen.',
  keywords: 'delivery management software, restaurant delivery system, Zomato Swiggy integration, delivery order tracking, multi-platform delivery dashboard',
  openGraph: {
    title: 'Delivery Order Management | DineOpen',
    description: 'Manage Zomato, Swiggy, and direct delivery orders from one dashboard. Track riders and analyze platform revenue.',
    url: 'https://www.dineopen.com/features/delivery-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delivery Order Management | DineOpen',
    description: 'Manage Zomato, Swiggy, and direct delivery orders from one dashboard. Track riders and analyze platform revenue.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/delivery-management',
  },
};

export default function DeliveryManagementPage() {
  return <DeliveryManagementClient />;
}
