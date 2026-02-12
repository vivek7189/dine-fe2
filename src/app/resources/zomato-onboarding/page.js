import ZomatoOnboardingClient from './ZomatoOnboardingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'How to Register Restaurant on Zomato | Complete Guide 2024 | DineOpen',
  description: 'Step-by-step guide to register your restaurant on Zomato. Requirements, documents, commission rates, and tips to get listed fast. Updated for 2024.',
  keywords: 'register on zomato, zomato partner registration, zomato restaurant listing, how to add restaurant on zomato, zomato for business, zomato seller registration',
  openGraph: {
    title: 'How to Register Restaurant on Zomato | DineOpen',
    description: 'Complete guide to get your restaurant listed on Zomato. Documents, process, and tips.',
    url: 'https://www.dineopen.com/resources/zomato-onboarding',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/zomato-onboarding' },
};

export default function ZomatoOnboardingPage() {
  return <ZomatoOnboardingClient />;
}
