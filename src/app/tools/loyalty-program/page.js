import LoyaltyProgramClient from './LoyaltyProgramClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Loyalty Program Software Free 2026 — +40% Repeat Customers | DineOpen',
  description: 'Free restaurant loyalty program software with points, cashback, rewards & WhatsApp campaigns. Reelo alternative with zero fees. Increase repeat customers by 40%. Works on any device. No credit card needed.',
  keywords: 'restaurant loyalty program software, restaurant loyalty program India, restaurant loyalty program software free, customer rewards software, restaurant CRM, repeat customer program, dining rewards, restaurant customer retention, Reelo alternative, points redemption system, cashback rewards restaurant, WhatsApp marketing restaurant, loyalty card software free, loyalty program for restaurant',
  openGraph: {
    title: 'Restaurant Loyalty Program Software Free — +40% Repeat Customers | DineOpen',
    description: 'Create loyalty programs with points, rewards & WhatsApp campaigns. Reelo alternative with zero fees. Free trial.',
    url: 'https://www.dineopen.com/tools/loyalty-program',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Loyalty Program Software [Free] | DineOpen',
    description: 'Points, rewards, cashback & WhatsApp campaigns. +40% repeat customers. Reelo alternative, zero fees.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/loyalty-program',
  },
};

export default function LoyaltyProgramPage() {
  return <LoyaltyProgramClient />;
}
