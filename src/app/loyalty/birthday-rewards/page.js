import BirthdayRewardsClient from './BirthdayRewardsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Birthday Rewards Program for Restaurants | DineOpen',
  description: 'Automate birthday rewards for your restaurant customers. Send personalized offers via WhatsApp and SMS. Boost loyalty with birthday month promotions.',
  keywords: 'birthday rewards, restaurant birthday program, customer birthday offers, automated birthday messages, restaurant loyalty',
  openGraph: {
    title: 'Birthday Rewards Program for Restaurants | DineOpen',
    description: 'Automate birthday rewards for your restaurant customers. Send personalized offers via WhatsApp and SMS. Boost loyalty with birthday month promotions.',
    url: 'https://www.dineopen.com/loyalty/birthday-rewards',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday Rewards Program for Restaurants | DineOpen',
    description: 'Automate birthday rewards for your restaurant customers. Send personalized offers via WhatsApp and SMS. Boost loyalty with birthday month promotions.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/loyalty/birthday-rewards',
  },
};

export default function BirthdayRewardsPage() {
  return <BirthdayRewardsClient />;
}
