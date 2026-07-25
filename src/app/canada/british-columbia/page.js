import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS British Columbia | GST+PST & Tips | DineOpen',
  description: 'Modern restaurant POS for British Columbia restaurants in Vancouver, Victoria & Surrey. GST 5% + PST 7% (+ liquor rules), tip pooling, SkipTheDishes/Uber Eats/DoorDash, Interac & Apple Pay. A Lightspeed & TouchBistro alternative from C$14/mo.',
  keywords: 'restaurant POS British Columbia, restaurant POS Vancouver, BC PST POS, Lightspeed alternative BC, TouchBistro alternative Vancouver, Victoria restaurant POS',
  alternates: { canonical: 'https://www.dineopen.com/canada/british-columbia', languages: { 'en-CA': 'https://www.dineopen.com/canada/british-columbia' } },
  openGraph: { title: 'Restaurant POS British Columbia | DineOpen', description: 'Modern POS for BC restaurants. GST+PST, tips, SkipTheDishes/Uber Eats. From C$14/mo.', url: 'https://www.dineopen.com/canada/british-columbia', siteName: 'DineOpen', locale: 'en_CA', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'british-columbia',
  name: 'British Columbia',
  hero: {
    badge: 'Restaurant POS in British Columbia',
    h1: 'The modern restaurant POS for BC restaurants',
    sub: 'From Vancouver and Victoria to Surrey and Kelowna — cloud POS with GST + PST, liquor-tax handling and SkipTheDishes built in. A cheaper, no-lock-in alternative to Lightspeed and TouchBistro.',
  },
  stats: [
    { value: 'C$14/mo', label: 'Starting price' },
    { value: '5% + 7%', label: 'GST + BC PST' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'GST 5% + BC PST 7% applied automatically',
    'Liquor PST handling for bars & pubs',
    'Tip pooling & tip-out records',
    'Bilingual English/French receipts available',
  ],
  faqs: [
    { q: 'Does DineOpen handle BC GST and PST?', a: 'Yes. DineOpen automatically applies the 5% federal GST plus British Columbia’s 7% PST on every check for Vancouver, Victoria, Surrey and across BC, including liquor PST for bars.' },
    { q: 'Is DineOpen a good Lightspeed or TouchBistro alternative in BC?', a: 'Yes. BC restaurants get cloud POS, AI ordering, inventory and SkipTheDishes/Uber Eats/DoorDash integrations with zero transaction fees and no lock-in from C$14/month.' },
    { q: 'Which payments and delivery apps work in BC?', a: 'DineOpen accepts Interac Debit, Visa, Mastercard, Amex, Apple Pay and Google Pay, and integrates with SkipTheDishes, Uber Eats and DoorDash.' },
  ],
};

export default function BCPOSPage() {
  return <CountryHubClient data={buildLocationData('canada', LOC)} />;
}
