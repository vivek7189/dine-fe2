import DhabasClient from './DhabasClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Dhabas India | Highway & Roadside Restaurants | DineOpen',
  description: 'Best POS for dhabas, highway restaurants & roadside eateries in India. Quick billing, driver loyalty, 24-hour operations, offline mode, GST compliance. ₹999/month.',
  keywords: 'dhaba POS India, highway restaurant software, roadside dhaba billing, truck driver loyalty, 24 hour restaurant POS, offline billing software',
  openGraph: {
    title: 'POS Software for Dhabas India | Highway Restaurant | DineOpen',
    description: 'Best POS for dhabas with quick billing, driver loyalty, and 24-hour operation support.',
    url: 'https://www.dineopen.com/for/dhabas',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/dhabas' },
};

export default function DhabasPage() {
  return <DhabasClient />;
}
