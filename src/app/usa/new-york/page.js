import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS New York | NYC Sales Tax & Tips Ready | DineOpen',
  description: 'Modern restaurant POS for New York restaurants in NYC, Brooklyn, Buffalo & Rochester. New York sales tax (NYC ~8.875%), tip credit reporting, ADA-ready, DoorDash/Uber Eats/Grubhub. A Toast & Square alternative from $10/mo.',
  keywords: 'restaurant POS New York, restaurant POS NYC, NYC sales tax POS, restaurant POS Brooklyn, Toast alternative New York, New York restaurant software',
  alternates: { canonical: 'https://www.dineopen.com/usa/new-york', languages: { 'en-US': 'https://www.dineopen.com/usa/new-york' } },
  openGraph: { title: 'Restaurant POS New York | DineOpen', description: 'Modern POS for New York restaurants. NYC sales tax, tips, delivery. From $10/mo.', url: 'https://www.dineopen.com/usa/new-york', siteName: 'DineOpen', locale: 'en_US', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'new-york',
  name: 'New York',
  hero: {
    badge: 'Restaurant POS in New York',
    h1: 'The modern restaurant POS for New York restaurants',
    sub: 'From NYC and Brooklyn to Buffalo and Rochester — cloud POS with New York sales tax, tip-credit reporting and delivery built in. Switch from Toast or Square with no hardware lock-in.',
  },
  stats: [
    { value: '$10/mo', label: 'Starting price' },
    { value: '~8.875%', label: 'NYC sales tax' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'New York sales tax: 4% state + local (NYC ~8.875%)',
    'Tip-credit & Form 8027 tip reporting',
    'ADA-compliant ordering & receipts',
    'Handles NYC, Brooklyn, Buffalo & upstate rates',
  ],
  faqs: [
    { q: 'Does DineOpen handle New York and NYC sales tax?', a: 'Yes. DineOpen applies New York’s 4% state rate plus the local rate — about 8.875% in New York City — and the correct rates for Brooklyn, Buffalo, Rochester and upstate locations.' },
    { q: 'Is DineOpen a good Toast or Square alternative in New York?', a: 'Yes. New York restaurants get cloud POS, AI ordering, inventory and DoorDash/Uber Eats/Grubhub integrations with zero transaction fees and no hardware lock-in from $10/month.' },
    { q: 'Does it support New York tip-credit reporting?', a: 'Yes. DineOpen records tips, supports tip pooling and produces IRS Form 8027 data to help meet New York tip-credit and wage requirements.' },
  ],
};

export default function NewYorkPOSPage() {
  return <CountryHubClient data={buildLocationData('usa', LOC)} />;
}
