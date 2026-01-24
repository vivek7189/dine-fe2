import RestaurantsClient from './RestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Small Restaurants India | DineOpen',
  description: 'Best POS software for small restaurants in India. QR menu, GST billing, UPI payments, inventory management. Built for dhabas, family restaurants & eateries.',
  keywords: 'restaurant POS India, small restaurant billing software, dhaba POS system, family restaurant software, restaurant management India',
  openGraph: {
    title: 'POS Software for Small Restaurants India | DineOpen',
    description: 'Best POS software for small restaurants in India with QR menu, GST billing, and UPI payments.',
    url: 'https://www.dineopen.com/for/restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/restaurants',
  },
};

export default function RestaurantsPage() {
  return <RestaurantsClient />;
}
