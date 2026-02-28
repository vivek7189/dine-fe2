import CustomerRewardsClient from './CustomerRewardsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Customer Rewards System for Restaurants | DineOpen',
  description: 'Create flexible reward programs with discounts, free items, and VIP perks. Points accumulate automatically through your POS with easy one-tap redemption.',
  keywords: 'customer rewards, restaurant rewards system, loyalty points, free items rewards, restaurant discounts, POS rewards',
  openGraph: {
    title: 'Customer Rewards System for Restaurants | DineOpen',
    description: 'Create flexible reward programs with discounts, free items, and VIP perks. Points accumulate automatically through your POS with easy one-tap redemption.',
    url: 'https://www.dineopen.com/loyalty/customer-rewards',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Rewards System for Restaurants | DineOpen',
    description: 'Create flexible reward programs with discounts, free items, and VIP perks. Points accumulate automatically through your POS with easy one-tap redemption.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/loyalty/customer-rewards',
  },
};

export default function CustomerRewardsPage() {
  return <CustomerRewardsClient />;
}
