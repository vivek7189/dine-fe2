import NorthIndianRestaurantsClient from './NorthIndianRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for North Indian Restaurants | Punjabi, Mughlai | DineOpen',
  description: 'Best POS software for North Indian restaurants. Tandoor management, butter chicken portions, naan queue. Perfect for Punjabi dhaba, Mughlai cuisine, and North Indian fine dining.',
  keywords: 'North Indian restaurant POS, Punjabi restaurant software, Mughlai cuisine billing, tandoor management POS, butter chicken restaurant software, dhaba POS software',
  openGraph: {
    title: 'POS Software for North Indian Restaurants | DineOpen',
    description: 'Specialized POS for North Indian restaurants with tandoor management and portion control.',
    url: 'https://www.dineopen.com/for/north-indian-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/north-indian-restaurants',
  },
};

export default function NorthIndianRestaurantsPage() {
  return <NorthIndianRestaurantsClient />;
}
