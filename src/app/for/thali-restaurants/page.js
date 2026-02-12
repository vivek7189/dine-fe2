import ThaliRestaurantsClient from './ThaliRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Thali Restaurants | Gujarati, Rajasthani Thali | DineOpen',
  description: 'Best POS software for unlimited thali restaurants. Track refills, manage unlimited items, handle rush hours. Perfect for Gujarati thali, Rajasthani thali, South Indian meals.',
  keywords: 'thali restaurant POS, unlimited thali software, Gujarati thali billing, Rajasthani thali POS, meals restaurant software, thali refill tracking',
  openGraph: {
    title: 'POS Software for Thali Restaurants | DineOpen',
    description: 'Specialized POS for thali restaurants with unlimited item tracking and refill management.',
    url: 'https://www.dineopen.com/for/thali-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/thali-restaurants',
  },
};

export default function ThaliRestaurantsPage() {
  return <ThaliRestaurantsClient />;
}
