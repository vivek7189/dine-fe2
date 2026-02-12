import SouthIndianRestaurantsClient from './SouthIndianRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for South Indian Restaurants | Dosa, Idli, Filter Coffee | DineOpen',
  description: 'Best POS software for South Indian restaurants. Manage dosa variants, idli combos, filter coffee tracking. Perfect for Udupi hotels, darshinis, and authentic South Indian cuisine.',
  keywords: 'South Indian restaurant POS, dosa restaurant software, idli billing software, filter coffee shop POS, Udupi hotel POS, darshini software, Tamil restaurant POS',
  openGraph: {
    title: 'POS Software for South Indian Restaurants | DineOpen',
    description: 'Specialized POS for South Indian restaurants with dosa variants and filter coffee management.',
    url: 'https://www.dineopen.com/for/south-indian-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/south-indian-restaurants',
  },
};

export default function SouthIndianRestaurantsPage() {
  return <SouthIndianRestaurantsClient />;
}
