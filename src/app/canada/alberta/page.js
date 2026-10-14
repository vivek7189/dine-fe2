import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Alberta | 5% GST, No PST | DineOpen',
  description: 'Modern restaurant POS for Alberta restaurants in Calgary, Edmonton & Red Deer. 5% GST only (no provincial sales tax), tip pooling, commission-free online ordering, Interac & Apple Pay. A Lightspeed & TouchBistro alternative from US$20/mo.',
  keywords: 'restaurant POS Alberta, restaurant POS Calgary, restaurant POS Edmonton, Alberta GST POS, Lightspeed alternative Alberta, TouchBistro alternative Calgary',
  alternates: { canonical: 'https://www.dineopen.com/canada/alberta', languages: { 'en-CA': 'https://www.dineopen.com/canada/alberta' } },
  openGraph: { title: 'Restaurant POS Alberta | DineOpen', description: 'Modern POS for Alberta restaurants. 5% GST only, tips, online ordering. From US$20/mo.', url: 'https://www.dineopen.com/canada/alberta', siteName: 'DineOpen', locale: 'en_CA', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'alberta',
  name: 'Alberta',
  hero: {
    badge: 'Restaurant POS in Alberta',
    h1: 'The modern restaurant POS for Alberta restaurants',
    sub: 'From Calgary and Edmonton to Red Deer — cloud POS with Alberta’s simple 5% GST (no provincial sales tax), tips and commission-free direct ordering built in. A cheaper, no-lock-in alternative to Lightspeed and TouchBistro.',
  },
  stats: [
    { value: 'US$20/mo', label: 'Starting price' },
    { value: '5% GST', label: 'No provincial PST' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'Alberta 5% GST only — no provincial sales tax',
    'Tip pooling & tip-out records',
    'Interac & tap-to-pay ready',
    'Bilingual English/French receipts available',
  ],
  faqs: [
    { q: 'Does DineOpen handle Alberta sales tax?', a: 'Yes. Alberta has no provincial sales tax, so DineOpen applies only the 5% federal GST on every check for Calgary, Edmonton, Red Deer and across the province.' },
    { q: 'Is DineOpen a good Lightspeed or TouchBistro alternative in Alberta?', a: 'Yes. Alberta restaurants get cloud POS, AI ordering, inventory and commission-free online ordering with zero transaction fees and no lock-in from US$20/month.' },
    { q: 'Which payments and delivery apps work in Alberta?', a: 'DineOpen accepts Interac Debit, Visa, Mastercard, Amex, Apple Pay and Google Pay. SkipTheDishes, Uber Eats and DoorDash orders can be recorded on the POS and tracked separately in reports (no automatic order sync today).' },
  ],
};

export default function AlbertaPOSPage() {
  return <CountryHubClient data={buildLocationData('canada', LOC)} />;
}
