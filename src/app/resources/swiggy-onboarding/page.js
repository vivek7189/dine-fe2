import SwiggyOnboardingClient from './SwiggyOnboardingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'How to Register Restaurant on Swiggy | Complete Guide 2024 | DineOpen',
  description: 'Step-by-step guide to register your restaurant on Swiggy. Requirements, documents needed, commission rates, and tips to get approved fast. Updated for 2024.',
  keywords: 'register on swiggy, swiggy partner registration, swiggy restaurant registration, how to list restaurant on swiggy, swiggy onboarding, swiggy seller registration',
  openGraph: {
    title: 'How to Register Restaurant on Swiggy | DineOpen',
    description: 'Complete guide to get your restaurant listed on Swiggy. Documents, process, and tips.',
    url: 'https://www.dineopen.com/resources/swiggy-onboarding',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/swiggy-onboarding' },
};

export default function SwiggyOnboardingPage() {
  return <SwiggyOnboardingClient />;
}
