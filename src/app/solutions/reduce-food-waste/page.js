import ReduceFoodWasteClient from './ReduceFoodWasteClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Reduce Food Waste in Restaurants | DineOpen',
  description: 'Cut restaurant food waste by up to 30% with DineOpen. Demand forecasting, inventory tracking, expiry alerts, and waste logging tools for smarter kitchen ops.',
  keywords: 'reduce food waste, restaurant waste management, food cost control, inventory tracking, demand forecasting, DineOpen, restaurant POS',
  openGraph: {
    title: 'Reduce Food Waste in Restaurants | DineOpen',
    description: 'Cut restaurant food waste by up to 30% with DineOpen. Demand forecasting, inventory tracking, expiry alerts, and waste logging tools for smarter kitchen ops.',
    url: 'https://www.dineopen.com/solutions/reduce-food-waste',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reduce Food Waste in Restaurants | DineOpen',
    description: 'Cut restaurant food waste by up to 30% with DineOpen. Demand forecasting, inventory tracking, expiry alerts, and waste logging tools for smarter kitchen ops.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/reduce-food-waste',
  },
};

export default function ReduceFoodWastePage() {
  return <ReduceFoodWasteClient />;
}
