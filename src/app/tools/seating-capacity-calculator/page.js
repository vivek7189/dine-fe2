import SeatingCapacityClient from './SeatingCapacityClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Seating Capacity Calculator | Seats Per Sq Ft | DineOpen',
  description: 'Free calculator to determine optimal restaurant seating capacity. Calculate seats per square foot based on layout style - fine dining, casual, QSR, cafe.',
  keywords: 'restaurant seating capacity calculator, seats per square foot, restaurant layout planning, how many seats restaurant, seating capacity formula',
  openGraph: {
    title: 'Restaurant Seating Capacity Calculator | DineOpen',
    description: 'Calculate optimal seating capacity for your restaurant based on area and layout style.',
    url: 'https://www.dineopen.com/tools/seating-capacity-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/seating-capacity-calculator' },
};

export default function SeatingCapacityCalculatorPage() {
  return <SeatingCapacityClient />;
}
