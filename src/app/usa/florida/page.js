import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Florida | Sales Tax & Tips Ready | DineOpen',
  description: 'Modern restaurant POS for Florida restaurants in Miami, Orlando, Tampa & Jacksonville. Florida sales tax (6% + county surtax), tip reporting, ADA-ready, DoorDash/Uber Eats/Grubhub. A Toast & Square alternative from $10/mo.',
  keywords: 'restaurant POS Florida, restaurant POS Miami, restaurant POS Orlando, Florida sales tax POS, Toast alternative Florida, Tampa restaurant POS',
  alternates: { canonical: 'https://www.dineopen.com/usa/florida', languages: { 'en-US': 'https://www.dineopen.com/usa/florida' } },
  openGraph: { title: 'Restaurant POS Florida | DineOpen', description: 'Modern POS for Florida restaurants. Sales tax, tips, delivery. From $10/mo.', url: 'https://www.dineopen.com/usa/florida', siteName: 'DineOpen', locale: 'en_US', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'florida',
  name: 'Florida',
  hero: {
    badge: 'Restaurant POS in Florida',
    h1: 'The modern restaurant POS for Florida restaurants',
    sub: 'From Miami and Orlando to Tampa and Jacksonville — cloud POS with Florida sales tax, tip reporting and delivery built in. A no-lock-in Toast and Square alternative for high-season volume.',
  },
  stats: [
    { value: '$10/mo', label: 'Starting price' },
    { value: '6%+', label: 'FL sales tax base' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'Florida sales tax: 6% state + county discretionary surtax',
    'Auto surtax rates for Miami-Dade, Orange, Hillsborough & Duval',
    'IRS tip reporting (Form 8027) + tip pooling',
    'ADA-compliant ordering & receipts',
  ],
  faqs: [
    { q: 'Does DineOpen handle Florida sales tax and county surtax?', a: 'Yes. DineOpen applies Florida’s 6% state rate plus the discretionary county surtax for locations such as Miami-Dade, Orange (Orlando), Hillsborough (Tampa) and Duval (Jacksonville).' },
    { q: 'Is DineOpen a good Toast or Square alternative in Florida?', a: 'Yes. Florida restaurants get cloud POS, AI ordering, inventory and DoorDash/Uber Eats/Grubhub integrations with zero transaction fees and no hardware lock-in from $10/month — ideal for handling seasonal tourist volume.' },
    { q: 'Does it support tips and seasonal staffing?', a: 'Yes. DineOpen supports tip lines, tip pooling, Form 8027 reporting and fast staff onboarding, which suits Florida’s seasonal restaurant and bar operations.' },
  ],
};

export default function FloridaPOSPage() {
  return <CountryHubClient data={buildLocationData('usa', LOC)} />;
}
