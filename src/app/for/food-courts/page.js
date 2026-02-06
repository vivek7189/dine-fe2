import FoodCourtsClient from './FoodCourtsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Food Courts & Mall Food Zones India | DineOpen',
  description: 'Best POS for mall food courts, food zones & multi-vendor setups. Centralized billing, token system, split payments, high-speed checkout. ₹999/month.',
  keywords: 'food court POS India, mall food court software, multi-vendor POS, food zone billing, token system POS, centralized food court billing',
  openGraph: {
    title: 'POS Software for Food Courts & Mall Food Zones India | DineOpen',
    description: 'Best POS for food courts with centralized billing, token system, and high-speed checkout.',
    url: 'https://www.dineopen.com/for/food-courts',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/food-courts' },
};

export default function FoodCourtsPage() {
  return <FoodCourtsClient />;
}
