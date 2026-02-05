import LoyaltyProgramClient from './LoyaltyProgramClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Loyalty Program & Rewards Points | Reelo Alternative | DineOpen',
  description: 'Free restaurant loyalty & rewards program. Points system, cashback, redemption, WhatsApp campaigns. Reelo alternative with zero fees. Increase repeat customers by 40%. Free trial.',
  keywords: 'restaurant loyalty program India, customer rewards software, restaurant CRM, repeat customer program, dining rewards, restaurant customer retention, Reelo alternative, points redemption system, cashback rewards restaurant, WhatsApp marketing restaurant, loyalty card software free',
  openGraph: {
    title: 'Free Restaurant Loyalty Program | Reelo Alternative | DineOpen',
    description: 'Create customer loyalty programs with points, rewards, redemption & WhatsApp campaigns. Free with DineOpen POS.',
    url: 'https://www.dineopen.com/tools/loyalty-program',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Loyalty Program | Reelo Alternative | DineOpen',
    description: 'Points, rewards, redemption & WhatsApp campaigns. Increase repeat customers by 40%.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/loyalty-program',
  },
};

export default function LoyaltyProgramPage() {
  return <LoyaltyProgramClient />;
}
