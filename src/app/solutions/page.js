import SolutionsClient from './SolutionsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Solutions | POS for Every Business Type | DineOpen',
  description: 'DineOpen provides tailored restaurant POS solutions for cafes, cloud kitchens, QSR, fine dining, food trucks, bakeries, bars, and more. Find the perfect solution for your business.',
  keywords: 'restaurant solutions, cafe POS, cloud kitchen POS, QSR POS, fine dining POS, food truck POS, bakery POS, bar POS, restaurant management solutions',
  openGraph: {
    title: 'Restaurant Solutions | DineOpen',
    description: 'Tailored POS solutions for every type of restaurant business. Cafes, cloud kitchens, QSR, fine dining, and more.',
    url: 'https://www.dineopen.com/solutions',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions',
  },
};

export default function SolutionsPage() {
  return <SolutionsClient />;
}
