import FoodDeliveryManagementClient from './FoodDeliveryManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Food Delivery Management System | DineOpen',
  description: 'Manage Zomato, Swiggy, and direct orders from one dashboard. Order aggregation, rider management, prep tracking, and platform analytics with DineOpen POS.',
  keywords: 'food delivery management, order aggregation, Zomato Swiggy integration, delivery POS, restaurant delivery system, DineOpen, multi-platform orders',
  openGraph: {
    title: 'Food Delivery Management System | DineOpen',
    description: 'Manage Zomato, Swiggy, and direct orders from one dashboard. Order aggregation, rider management, prep tracking, and platform analytics with DineOpen POS.',
    url: 'https://www.dineopen.com/solutions/food-delivery-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Delivery Management System | DineOpen',
    description: 'Manage Zomato, Swiggy, and direct orders from one dashboard. Order aggregation, rider management, prep tracking, and platform analytics with DineOpen POS.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/food-delivery-management',
  },
};

export default function FoodDeliveryManagementPage() {
  return <FoodDeliveryManagementClient />;
}
