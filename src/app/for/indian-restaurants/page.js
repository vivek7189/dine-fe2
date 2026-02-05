import IndianRestaurantsClient from './IndianRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Indian Restaurants | Thali, Biryani, Tandoor | DineOpen',
  description: 'Best POS software for Indian restaurants. Manage thali combos, tandoor orders, biryani portions, regional cuisines. Multi-language support, GST billing, delivery integration.',
  keywords: 'Indian restaurant POS, thali restaurant software, biryani restaurant POS, tandoor management, North Indian restaurant software, South Indian restaurant POS, regional cuisine POS India',
  openGraph: {
    title: 'POS Software for Indian Restaurants | DineOpen',
    description: 'Specialized POS for Indian restaurants with thali management, regional cuisine support, and multi-language ordering.',
    url: 'https://www.dineopen.com/for/indian-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/indian-restaurants',
  },
};

export default function IndianRestaurantsPage() {
  return <IndianRestaurantsClient />;
}
