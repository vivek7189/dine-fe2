import StreetFoodClient from './StreetFoodClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Street Food | Chaat, Vada Pav, Pav Bhaji | DineOpen',
  description: 'Best POS software for street food stalls. Quick billing, variant management, evening rush handling. Perfect for chaat counters, vada pav stalls, pav bhaji centers, and golgappa shops.',
  keywords: 'street food POS, chaat counter billing, vada pav stall software, pav bhaji billing, golgappa shop POS, panipuri billing software, street food stall software',
  openGraph: {
    title: 'POS Software for Street Food | DineOpen',
    description: 'Specialized POS for street food with quick billing and rush hour management.',
    url: 'https://www.dineopen.com/for/street-food',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/street-food',
  },
};

export default function StreetFoodPage() {
  return <StreetFoodClient />;
}
