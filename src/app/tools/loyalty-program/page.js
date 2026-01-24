import LoyaltyProgramClient from './LoyaltyProgramClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Loyalty Program Software India | DineOpen',
  description: 'Create customer loyalty programs for your restaurant. Points, rewards, birthday offers, WhatsApp engagement. Build repeat customers and increase lifetime value.',
  keywords: 'restaurant loyalty program India, customer rewards software, restaurant CRM, repeat customer program, dining rewards, restaurant customer retention',
  openGraph: {
    title: 'Free Restaurant Loyalty Program Software India | DineOpen',
    description: 'Create customer loyalty programs with points, rewards, and birthday offers.',
    url: 'https://www.dineopen.com/tools/loyalty-program',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/loyalty-program',
  },
};

export default function LoyaltyProgramPage() {
  return <LoyaltyProgramClient />;
}
