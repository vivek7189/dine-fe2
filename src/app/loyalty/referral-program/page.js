import ReferralProgramClient from './ReferralProgramClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Referral Program Software | DineOpen',
  description: 'Turn happy customers into brand ambassadors with automated referral rewards. Both referrer and friend get rewarded. Grow your restaurant on autopilot.',
  keywords: 'referral program, restaurant referrals, refer a friend, customer referral rewards, word of mouth marketing, restaurant growth',
  openGraph: {
    title: 'Restaurant Referral Program Software | DineOpen',
    description: 'Turn happy customers into brand ambassadors with automated referral rewards. Both referrer and friend get rewarded. Grow your restaurant on autopilot.',
    url: 'https://www.dineopen.com/loyalty/referral-program',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Referral Program Software | DineOpen',
    description: 'Turn happy customers into brand ambassadors with automated referral rewards. Both referrer and friend get rewarded. Grow your restaurant on autopilot.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/loyalty/referral-program',
  },
};

export default function ReferralProgramPage() {
  return <ReferralProgramClient />;
}
