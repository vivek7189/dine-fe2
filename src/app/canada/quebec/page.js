import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Quebec | GST+QST, Bill 72 & Bilingual | DineOpen',
  description: 'Modern restaurant POS for Quebec restaurants in Montreal, Quebec City & Laval. GST 5% + QST 9.975%, Bill 72 pre-tax tipping, mandatory French receipts, SkipTheDishes/Uber Eats. A Lightspeed & TouchBistro alternative from C$14/mo.',
  keywords: 'restaurant POS Quebec, restaurant POS Montreal, Quebec QST POS, Bill 72 tipping POS, French restaurant POS, Lightspeed alternative Quebec, Web-SRM POS',
  alternates: { canonical: 'https://www.dineopen.com/canada/quebec', languages: { 'en-CA': 'https://www.dineopen.com/canada/quebec', 'fr-CA': 'https://www.dineopen.com/canada/quebec' } },
  openGraph: { title: 'Restaurant POS Quebec | DineOpen', description: 'Modern POS for Quebec restaurants. GST+QST, Bill 72 tipping, French receipts. From C$14/mo.', url: 'https://www.dineopen.com/canada/quebec', siteName: 'DineOpen', locale: 'en_CA', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'quebec',
  name: 'Quebec',
  hero: {
    badge: 'Restaurant POS in Quebec',
    h1: 'The modern restaurant POS for Quebec restaurants',
    sub: 'From Montreal and Quebec City to Laval — cloud POS with GST + QST, Bill 72 pre-tax tipping and bilingual French receipts built in. A cheaper, no-lock-in alternative to Lightspeed and TouchBistro.',
  },
  stats: [
    { value: 'C$14/mo', label: 'Starting price' },
    { value: '5% + 9.975%', label: 'GST + QST' },
    { value: '0%', label: 'Transaction fees' },
    { value: 'FR/EN', label: 'Bilingual receipts' },
  ],
  compliance: [
    'GST 5% + Quebec QST 9.975% applied automatically',
    'Bill 72: tips calculated on pre-tax subtotal, neutral prompt',
    'Mandatory French-language receipts & menus',
    'Web-SRM (SEV) fiscal reporting readiness',
  ],
  faqs: [
    { q: 'Does DineOpen handle Quebec GST and QST?', a: 'Yes. DineOpen automatically applies the 5% federal GST plus Quebec’s 9.975% QST on every check for Montreal, Quebec City, Laval and across the province.' },
    { q: 'Is DineOpen compliant with Quebec’s Bill 72 tipping rules?', a: 'Yes. DineOpen calculates tips on the pre-tax subtotal, presents tip options neutrally and allows a custom tip, in line with Quebec’s Bill 72 requirements, and supports bilingual French/English receipts.' },
    { q: 'Does it support French receipts and Web-SRM?', a: 'Yes. DineOpen prints mandatory French-language receipts and menus and is built to support Quebec’s Web-SRM (SEV) fiscal reporting for restaurants.' },
  ],
};

export default function QuebecPOSPage() {
  return <CountryHubClient data={buildLocationData('canada', LOC)} />;
}
