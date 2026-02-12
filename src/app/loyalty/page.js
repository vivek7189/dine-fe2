import LoyaltyClient from './LoyaltyClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Loyalty Program Software | Customer Rewards | DineOpen',
  description: 'Build customer loyalty with DineOpen\'s restaurant loyalty program. Birthday rewards, referral programs, points system, and customer retention tools.',
  keywords: 'restaurant loyalty program, customer rewards, birthday rewards, referral program, customer retention, restaurant points system',
  openGraph: {
    title: 'Restaurant Loyalty Program | DineOpen',
    description: 'Build customer loyalty with rewards, birthday offers, and referral programs.',
    url: 'https://www.dineopen.com/loyalty',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/loyalty',
  },
};

export default function LoyaltyPage() {
  return <LoyaltyClient />;
}
