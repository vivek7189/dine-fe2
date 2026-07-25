import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant EPOS London | VAT & Allergen Ready | DineOpen',
  description: 'Modern EPOS system for London restaurants, cafes, pubs & takeaways. 20% VAT (eat-in vs takeaway), Natasha’s Law allergens, FHRS-ready, Deliveroo/Just Eat/Uber Eats, contactless & Apple Pay. An EPOS Now & Lightspeed alternative from £8/mo.',
  keywords: 'restaurant EPOS London, EPOS system London, London restaurant POS, pub EPOS London, takeaway EPOS London, EPOS Now alternative London',
  alternates: { canonical: 'https://www.dineopen.com/uk/london', languages: { 'en-GB': 'https://www.dineopen.com/uk/london' } },
  openGraph: { title: 'Restaurant EPOS London | DineOpen', description: 'Modern EPOS for London restaurants & pubs. VAT, allergens, Deliveroo/Just Eat. From £8/mo.', url: 'https://www.dineopen.com/uk/london', siteName: 'DineOpen', locale: 'en_GB', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'london',
  name: 'London',
  hero: {
    badge: 'Restaurant EPOS in London',
    h1: 'The modern EPOS system for London restaurants',
    sub: 'From the City and Soho to Shoreditch and Camden — cloud EPOS with UK VAT, allergen labelling and Deliveroo/Just Eat built in. A simpler, cheaper alternative to EPOS Now and Lightspeed for London’s fast-paced venues.',
  },
  stats: [
    { value: '£8/mo', label: 'Starting price' },
    { value: '20%', label: 'VAT handled' },
    { value: '0%', label: 'Transaction fees' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: [
    '20% VAT with eat-in vs takeaway rates',
    'Natasha’s Law allergen info per item',
    'FHRS food-hygiene-ready records',
    'Making Tax Digital — Xero export',
  ],
  faqs: [
    { q: 'What is the best EPOS for London restaurants?', a: 'DineOpen is a modern cloud EPOS for London restaurants, pubs and takeaways with 20% VAT handling (eat-in vs takeaway), Natasha’s Law allergen labelling and Deliveroo/Just Eat/Uber Eats integrations — from £8/month with no transaction fees or lock-in, a simpler alternative to EPOS Now and Lightspeed.' },
    { q: 'Does it handle VAT and allergens for London venues?', a: 'Yes. DineOpen applies the correct 20% VAT with separate eat-in and takeaway rates, exports Making Tax Digital data to Xero, and displays Natasha’s Law allergen information for every menu item.' },
    { q: 'Which London delivery apps are supported?', a: 'DineOpen integrates with Deliveroo, Just Eat and Uber Eats — the main delivery platforms across London — plus direct QR-code ordering.' },
  ],
};

export default function LondonEPOSPage() {
  return <CountryHubClient data={buildLocationData('uk', LOC)} />;
}
