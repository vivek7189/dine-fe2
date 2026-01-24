import FoodTrucksClient from './FoodTrucksClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Food Trucks India | DineOpen',
  description: 'Best POS software for food trucks in India. Mobile billing, offline mode, QR ordering, compact interface. Works without stable internet.',
  keywords: 'food truck POS India, mobile food cart billing, street food POS, food stall software, portable restaurant POS India',
  openGraph: {
    title: 'POS Software for Food Trucks India | DineOpen',
    description: 'Best POS software for food trucks in India with mobile billing and offline mode.',
    url: 'https://www.dineopen.com/for/food-trucks',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/food-trucks',
  },
};

export default function FoodTrucksPage() {
  return <FoodTrucksClient />;
}
