import SmallRestaurantsClient from './SmallRestaurantsClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'POS for Small Restaurants India | Restaurant POS System | DineOpen',
  description: 'Best POS software for small restaurants in India. Affordable POS system starting at ₹899. Cloud-based, no hardware required. Perfect for restaurants with 1-20 tables.',
  keywords: 'POS for small restaurants, small restaurant POS software, restaurant POS system India, affordable POS software, cloud POS for restaurants',
  openGraph: {
    title: 'POS for Small Restaurants India | DineOpen',
    description: 'Affordable POS software for small restaurants in India. Cloud-based system starting at ₹899/month.',
    url: 'https://www.dineopen.com/products/pos-software/small-restaurants',
  },
};

export default function SmallRestaurantsPage() {
  return <SmallRestaurantsClient />;
}


