import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS California | Sales Tax & Tips Ready | DineOpen',
  description: 'Modern restaurant POS for California restaurants in LA, San Francisco, San Diego & San Jose. California sales tax (7.25% base + district rates), tip reporting, ADA-ready, DoorDash/Uber Eats. A Toast & Square alternative from $10/mo.',
  keywords: 'restaurant POS California, restaurant POS Los Angeles, restaurant POS San Francisco, California sales tax POS, Toast alternative California, San Diego restaurant POS',
  alternates: { canonical: 'https://www.dineopen.com/usa/california', languages: { 'en-US': 'https://www.dineopen.com/usa/california' } },
  openGraph: { title: 'Restaurant POS California | DineOpen', description: 'Modern POS for California restaurants. Sales tax, tips, ADA, delivery. From $10/mo.', url: 'https://www.dineopen.com/usa/california', siteName: 'DineOpen', locale: 'en_US', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'california',
  name: 'California',
  hero: {
    badge: 'Restaurant POS in California',
    h1: 'The modern restaurant POS for California restaurants',
    sub: 'From Los Angeles and San Francisco to San Diego and San Jose — cloud POS with California sales tax, tip reporting and delivery built in. Switch from Toast or Square without hardware lock-in.',
  },
  stats: [
    { value: '$10/mo', label: 'Starting price' },
    { value: '7.25%+', label: 'CA sales tax base' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'California sales tax: 7.25% base + district rates (up to ~10.75%)',
    'Auto local rates for LA, SF, San Diego & San Jose',
    'IRS tip reporting (Form 8027) + tip pooling',
    'ADA-compliant ordering & receipts',
  ],
  faqs: [
    { q: 'Does DineOpen handle California sales tax?', a: 'Yes. DineOpen applies California’s 7.25% statewide base rate plus the correct district (city/county) tax for locations such as Los Angeles, San Francisco, San Diego and San Jose, so every check is taxed correctly.' },
    { q: 'Is DineOpen a good Toast or Square alternative in California?', a: 'Yes. California restaurants get cloud POS, AI ordering, inventory and DoorDash/Uber Eats/Grubhub integrations with zero transaction fees and no hardware lock-in from $10/month — cheaper than Toast’s contracts and Square’s per-transaction fees.' },
    { q: 'Does it support California tip rules?', a: 'Yes. DineOpen supports tip lines, tip pooling and IRS Form 8027 reporting, and keeps a clear record for California’s tip and wage requirements.' },
  ],
};

export default function CaliforniaPOSPage() {
  return <CountryHubClient data={buildLocationData('usa', LOC)} />;
}
