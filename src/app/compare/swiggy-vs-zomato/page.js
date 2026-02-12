import SwiggyVsZomatoClient from './SwiggyVsZomatoClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Swiggy vs Zomato for Restaurants | Commission Comparison 2024 | DineOpen',
  description: 'Compare Swiggy and Zomato for restaurants. Commission rates, features, reach, payouts, and which platform is better for your restaurant business.',
  keywords: 'swiggy vs zomato commission, swiggy vs zomato for restaurants, zomato commission rate, swiggy commission rate, food delivery platform comparison',
  openGraph: {
    title: 'Swiggy vs Zomato for Restaurants | DineOpen',
    description: 'Complete comparison of Swiggy and Zomato for restaurant owners. Commission, features, and more.',
    url: 'https://www.dineopen.com/compare/swiggy-vs-zomato',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: { canonical: 'https://www.dineopen.com/compare/swiggy-vs-zomato' },
};

export default function SwiggyVsZomatoPage() {
  return <SwiggyVsZomatoClient />;
}
