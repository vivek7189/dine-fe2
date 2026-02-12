import POSLocationsClient from './POSLocationsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software by City | DineOpen Locations',
  description: 'Find DineOpen restaurant POS software in your city. Available in Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, and 25+ cities across India and worldwide.',
  keywords: 'restaurant POS Mumbai, POS software Delhi, Bangalore restaurant POS, Chennai POS, Hyderabad restaurant software, Pune POS, restaurant billing software India',
  openGraph: {
    title: 'Restaurant POS Software by City | DineOpen',
    description: 'Find DineOpen in your city. Available in 25+ cities across India and worldwide.',
    url: 'https://www.dineopen.com/pos',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos',
  },
};

export default function POSLocationsPage() {
  return <POSLocationsClient />;
}
