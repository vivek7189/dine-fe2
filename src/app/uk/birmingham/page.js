import CountryHubClient from '../../CountryHubClient';
import { buildLocationData } from '../../locationHubData';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant EPOS Birmingham | VAT & Allergen Ready | DineOpen',
  description: 'Modern EPOS system for Birmingham restaurants, curry houses & takeaways. 20% VAT (eat-in vs takeaway), Natasha’s Law allergens, FHRS-ready, Deliveroo/Just Eat/Uber Eats, contactless. An EPOS Now & Lightspeed alternative from £8/mo.',
  keywords: 'restaurant EPOS Birmingham, EPOS system Birmingham, Birmingham restaurant POS, balti house EPOS, curry house EPOS Birmingham, takeaway EPOS Birmingham',
  alternates: { canonical: 'https://www.dineopen.com/uk/birmingham', languages: { 'en-GB': 'https://www.dineopen.com/uk/birmingham' } },
  openGraph: { title: 'Restaurant EPOS Birmingham | DineOpen', description: 'Modern EPOS for Birmingham restaurants & takeaways. VAT, allergens, delivery. From £8/mo.', url: 'https://www.dineopen.com/uk/birmingham', siteName: 'DineOpen', locale: 'en_GB', type: 'website' },
  robots: { index: true, follow: true },
};

const LOC = {
  slug: 'birmingham',
  name: 'Birmingham',
  hero: {
    badge: 'Restaurant EPOS in Birmingham',
    h1: 'The modern EPOS system for Birmingham restaurants',
    sub: 'From the Balti Triangle to Brindleyplace — cloud EPOS with UK VAT, allergen labelling and Deliveroo/Just Eat built in. A simple, affordable alternative to EPOS Now for curry houses, restaurants and takeaways.',
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
    { q: 'What is the best EPOS for Birmingham restaurants and takeaways?', a: 'DineOpen is a modern cloud EPOS for Birmingham restaurants, curry houses and takeaways with 20% VAT (eat-in vs takeaway), Natasha’s Law allergens and Deliveroo/Just Eat/Uber Eats integrations — from £8/month with no transaction fees or lock-in.' },
    { q: 'Is it good for Birmingham curry houses and takeaways?', a: 'Yes. DineOpen handles collection and delivery orders, spice-level modifiers, allergen labelling and Just Eat/Deliveroo integration, making it well-suited to Birmingham’s Balti houses and takeaways.' },
    { q: 'Does it handle UK VAT and allergens?', a: 'Yes. DineOpen applies 20% VAT with eat-in/takeaway rates, exports MTD data to Xero, and shows Natasha’s Law allergen information per item.' },
  ],
};

export default function BirminghamEPOSPage() {
  return <CountryHubClient data={buildLocationData('uk', LOC)} />;
}
