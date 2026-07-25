import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Texas | Sales Tax & Mixed Beverage Ready | DineOpen',
  description: 'Modern restaurant POS for Texas restaurants in Houston, Dallas, Austin & San Antonio. Texas sales tax (6.25% + local up to 8.25%), mixed-beverage tax for bars, tip reporting, DoorDash/Uber Eats. A Toast & Square alternative from $10/mo.',
  keywords: 'restaurant POS Texas, restaurant POS Houston, restaurant POS Dallas, restaurant POS Austin, Texas mixed beverage tax POS, Toast alternative Texas',
  alternates: { canonical: 'https://www.dineopen.com/usa/texas', languages: { 'en-US': 'https://www.dineopen.com/usa/texas' } },
  openGraph: { title: 'Restaurant POS Texas | DineOpen', description: 'Modern POS for Texas restaurants & bars. Sales tax, mixed-beverage tax, delivery. From $10/mo.', url: 'https://www.dineopen.com/usa/texas', siteName: 'DineOpen', locale: 'en_US', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'texas',
  name: 'Texas',
  hero: {
    badge: 'Restaurant POS in Texas',
    h1: 'The modern restaurant POS for Texas restaurants',
    sub: 'From Houston and Dallas to Austin and San Antonio — cloud POS with Texas sales tax, mixed-beverage tracking for bars and delivery built in. A no-lock-in Toast and Square alternative.',
  },
  stats: [
    { value: '$10/mo', label: 'Starting price' },
    { value: '6.25%+', label: 'TX sales tax base' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    'Texas sales tax: 6.25% state + local (up to 8.25%)',
    'Mixed-beverage gross receipts/sales tax for bars',
    'IRS tip reporting (Form 8027) + tip pooling',
    'ADA-compliant ordering & receipts',
  ],
  faqs: [
    { q: 'Does DineOpen handle Texas sales tax and mixed-beverage tax?', a: 'Yes. DineOpen applies Texas’ 6.25% state rate plus local rates (up to 8.25% total) for Houston, Dallas, Austin and San Antonio, and tracks mixed-beverage sales so bars can report the Texas mixed-beverage tax correctly.' },
    { q: 'Is DineOpen a good Toast or Square alternative in Texas?', a: 'Yes. Texas restaurants get cloud POS, AI ordering, inventory and DoorDash/Uber Eats/Grubhub integrations with zero transaction fees and no hardware lock-in from $10/month.' },
    { q: 'Does it work for Texas bars and breweries?', a: 'Yes. DineOpen handles bar tabs, pre-authorization, tip-out and mixed-beverage tracking, making it well-suited to Texas bars, taprooms and breweries.' },
  ],
};

export default function TexasPOSPage() {
  return <CountryHubClient data={buildLocationData('usa', LOC)} />;
}
