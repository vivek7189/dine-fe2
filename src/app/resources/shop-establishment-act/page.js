import ShopEstablishmentClient from './ShopEstablishmentClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Shop & Establishment Act for Restaurants | State-wise Guide | DineOpen',
  description: 'Complete guide to Shop & Establishment registration for restaurants in India. State-wise requirements, fees, and compliance.',
  keywords: 'shop and establishment act, shop act registration, restaurant license, shop act restaurant, state labor license',
  openGraph: {
    title: 'Shop & Establishment Act for Restaurants',
    description: 'State-wise requirements for Shop & Establishment registration.',
    url: 'https://www.dineopen.com/resources/shop-establishment-act',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/shop-establishment-act',
  },
};

export default function ShopEstablishmentPage() {
  return <ShopEstablishmentClient />;
}
