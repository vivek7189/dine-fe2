import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Ontario | 13% HST & Tips Ready | DineOpen',
  description: 'Modern restaurant POS for Ontario restaurants in Toronto, Ottawa, Mississauga & Hamilton. 13% HST handling, tip pooling, SkipTheDishes/Uber Eats/DoorDash, Interac & Apple Pay. A Lightspeed & TouchBistro alternative from C$14/mo.',
  keywords: 'restaurant POS Ontario, restaurant POS Toronto, Ontario HST POS, Lightspeed alternative Ontario, TouchBistro alternative Toronto, Ottawa restaurant POS',
  alternates: { canonical: 'https://www.dineopen.com/canada/ontario', languages: { 'en-CA': 'https://www.dineopen.com/canada/ontario' } },
  openGraph: { title: 'Restaurant POS Ontario | DineOpen', description: 'Modern POS for Ontario restaurants. 13% HST, tips, SkipTheDishes/Uber Eats. From C$14/mo.', url: 'https://www.dineopen.com/canada/ontario', siteName: 'DineOpen', locale: 'en_CA', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'ontario',
  name: 'Ontario',
  hero: {
    badge: 'Restaurant POS in Ontario',
    h1: 'The modern restaurant POS for Ontario restaurants',
    sub: 'From Toronto and Ottawa to Mississauga and Hamilton — cloud POS with 13% HST, tips and SkipTheDishes built in. A cheaper, no-lock-in alternative to Lightspeed and TouchBistro.',
  },
  stats: [
    { value: 'C$14/mo', label: 'Starting price' },
    { value: '13%', label: 'Ontario HST' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'Ontario 13% HST applied automatically',
    'Tip pooling & tip-out records',
    'Interac & tap-to-pay ready',
    'Bilingual English/French receipts available',
  ],
  faqs: [
    { q: 'Does DineOpen handle Ontario HST?', a: 'Yes. DineOpen automatically applies Ontario’s 13% HST on every check for locations across Toronto, Ottawa, Mississauga, Hamilton and the rest of the province.' },
    { q: 'Is DineOpen a good Lightspeed or TouchBistro alternative in Ontario?', a: 'Yes. Ontario restaurants get cloud POS, AI ordering, inventory and SkipTheDishes/Uber Eats/DoorDash integrations with zero transaction fees and no lock-in from C$14/month — cheaper than Lightspeed and TouchBistro.' },
    { q: 'Which payments and delivery apps work in Ontario?', a: 'DineOpen accepts Interac Debit, Visa, Mastercard, Amex, Apple Pay and Google Pay, and integrates with SkipTheDishes, Uber Eats and DoorDash.' },
  ],
};

export default function OntarioPOSPage() {
  return <CountryHubClient data={buildLocationData('canada', LOC)} />;
}
