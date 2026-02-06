import DeliveryRadiusClient from './DeliveryRadiusClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Food Delivery Radius Calculator | Optimal Zone Planner | DineOpen',
  description: 'Calculate optimal food delivery radius based on delivery time, vehicle speed, and food quality. Plan efficient delivery zones for your restaurant.',
  keywords: 'delivery radius calculator, food delivery zone, delivery area planner, restaurant delivery distance, optimal delivery radius',
  openGraph: {
    title: 'Food Delivery Radius Calculator | DineOpen',
    description: 'Plan optimal delivery zones based on time, distance, and food quality.',
    url: 'https://www.dineopen.com/tools/delivery-radius-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/delivery-radius-calculator' },
};

export default function DeliveryRadiusCalculatorPage() {
  return <DeliveryRadiusClient />;
}
