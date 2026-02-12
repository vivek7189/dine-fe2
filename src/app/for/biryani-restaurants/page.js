import BiryaniRestaurantsClient from './BiryaniRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Biryani Restaurants | Hyderabadi, Lucknowi | DineOpen',
  description: 'Best POS software for biryani restaurants. Manage portion sizes (half/full/family), track dum cooking times, handle high-volume orders. Perfect for Hyderabadi, Lucknowi, Kolkata biryani.',
  keywords: 'biryani restaurant POS, biryani shop billing software, Hyderabadi biryani POS, Lucknowi biryani software, biryani portion management, dum biryani restaurant software',
  openGraph: {
    title: 'POS Software for Biryani Restaurants | DineOpen',
    description: 'Specialized POS for biryani restaurants with portion management and high-volume order handling.',
    url: 'https://www.dineopen.com/for/biryani-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/biryani-restaurants',
  },
};

export default function BiryaniRestaurantsPage() {
  return <BiryaniRestaurantsClient />;
}
