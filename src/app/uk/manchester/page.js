import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant EPOS Manchester | VAT & Allergen Ready | DineOpen',
  description: 'Modern EPOS system for Manchester restaurants, bars & takeaways. 20% VAT (eat-in vs takeaway), Natasha’s Law allergens, FHRS-ready, Deliveroo/Just Eat/Uber Eats, contactless. An EPOS Now & Lightspeed alternative from £8/mo.',
  keywords: 'restaurant EPOS Manchester, EPOS system Manchester, Manchester restaurant POS, bar EPOS Manchester, takeaway EPOS Manchester',
  alternates: { canonical: 'https://www.dineopen.com/uk/manchester', languages: { 'en-GB': 'https://www.dineopen.com/uk/manchester' } },
  openGraph: { title: 'Restaurant EPOS Manchester | DineOpen', description: 'Modern EPOS for Manchester restaurants & bars. VAT, allergens, delivery. From £8/mo.', url: 'https://www.dineopen.com/uk/manchester', siteName: 'DineOpen', locale: 'en_GB', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'manchester',
  name: 'Manchester',
  hero: {
    badge: 'Restaurant EPOS in Manchester',
    h1: 'The modern EPOS system for Manchester restaurants',
    sub: 'From the Northern Quarter to Deansgate and Spinningfields — cloud EPOS with UK VAT, allergen labelling and Deliveroo/Just Eat built in. A cheaper, no-lock-in alternative to EPOS Now and Lightspeed.',
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
    { q: 'What is the best EPOS for Manchester restaurants?', a: 'DineOpen is a modern cloud EPOS for Manchester restaurants, bars and takeaways with 20% VAT handling, Natasha’s Law allergens and Deliveroo/Just Eat/Uber Eats integrations — from £8/month with no transaction fees or lock-in.' },
    { q: 'Does it handle VAT and allergens?', a: 'Yes. DineOpen applies 20% VAT with separate eat-in and takeaway rates, exports Making Tax Digital data to Xero, and displays Natasha’s Law allergen information for every item.' },
    { q: 'Which delivery apps work in Manchester?', a: 'DineOpen integrates with Deliveroo, Just Eat and Uber Eats, plus direct QR-code ordering.' },
  ],
};

export default function ManchesterEPOSPage() {
  return <CountryHubClient data={buildLocationData('uk', LOC)} />;
}
