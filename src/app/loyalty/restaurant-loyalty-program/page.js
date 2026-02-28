import RestaurantLoyaltyProgramClient from './RestaurantLoyaltyProgramClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Loyalty Program Software | DineOpen',
  description: 'Build a points-based loyalty program with tiered rewards built into your POS. Track spending, reward regulars, and turn first-time visitors into lifelong customers.',
  keywords: 'restaurant loyalty program, loyalty software, points system, tiered rewards, digital loyalty card, POS loyalty program',
  openGraph: {
    title: 'Restaurant Loyalty Program Software | DineOpen',
    description: 'Build a points-based loyalty program with tiered rewards built into your POS. Track spending, reward regulars, and turn first-time visitors into lifelong customers.',
    url: 'https://www.dineopen.com/loyalty/restaurant-loyalty-program',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Loyalty Program Software | DineOpen',
    description: 'Build a points-based loyalty program with tiered rewards built into your POS. Track spending, reward regulars, and turn first-time visitors into lifelong customers.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/loyalty/restaurant-loyalty-program',
  },
};

export default function RestaurantLoyaltyProgramPage() {
  return <RestaurantLoyaltyProgramClient />;
}
