import POSSoftwareClient from './POSSoftwareClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software India | POS System for Restaurants | DineOpen',
  description: 'DineOpen POS software for restaurants in India. Cloud-based POS system with billing, menu management, inventory tracking, and online orders. Affordable pricing from ₹899. Best POS for small restaurants, cafes, and cloud kitchens.',
  keywords: 'restaurant POS software, POS system for restaurants, restaurant POS India, cloud POS software, restaurant billing software, POS for small restaurants, restaurant management system',
  openGraph: {
    title: 'Restaurant POS Software India | DineOpen',
    description: 'Cloud-based POS software for restaurants in India. Affordable, easy-to-use POS system with billing, menu management, and inventory tracking.',
    url: 'https://www.dineopen.com/products/pos-software',
  },
};

export default function POSSoftwarePage() {
  return <POSSoftwareClient />;
}


