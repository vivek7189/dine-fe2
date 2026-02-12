import GoogleBusinessClient from './GoogleBusinessClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Google My Business for Restaurants | Complete Setup Guide | DineOpen',
  description: 'How to set up and optimize Google My Business for your restaurant. Get found on Google Maps, attract more customers, and manage reviews.',
  keywords: 'google my business restaurant, google maps listing restaurant, GMB for restaurants, google business profile restaurant, restaurant google listing',
  openGraph: {
    title: 'Google My Business for Restaurants | DineOpen',
    description: 'Complete guide to setting up and optimizing your restaurant on Google.',
    url: 'https://www.dineopen.com/resources/google-business-guide',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/google-business-guide' },
};

export default function GoogleBusinessPage() {
  return <GoogleBusinessClient />;
}
