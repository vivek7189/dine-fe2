import CanteensClient from './CanteensClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Canteens India | Corporate, School, Factory | DineOpen',
  description: 'Best POS for canteens - corporate offices, schools, colleges, factories. Meal subscriptions, prepaid cards, subsidized billing, attendance integration. ₹999/month.',
  keywords: 'canteen POS India, corporate canteen software, school canteen billing, factory mess software, cafeteria management system, subsidized meal billing',
  openGraph: {
    title: 'POS Software for Canteens India | Corporate & School | DineOpen',
    description: 'Best POS for canteens with meal subscriptions, prepaid cards, and subsidized billing.',
    url: 'https://www.dineopen.com/for/canteens',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/canteens' },
};

export default function CanteensPage() {
  return <CanteensClient />;
}
