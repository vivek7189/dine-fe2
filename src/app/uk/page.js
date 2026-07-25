import CountryHubClient from '../CountryHubClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant EPOS System UK | VAT & Allergen Ready | DineOpen',
  description: 'Modern EPOS system for UK restaurants, cafes, pubs & takeaways — 20% VAT (eat-in vs takeaway), Natasha’s Law allergens, FHRS-ready, Deliveroo/Just Eat/Uber Eats, contactless & Apple Pay. An affordable EPOS Now, Lightspeed & Square alternative from £8/mo.',
  keywords: 'restaurant EPOS UK, EPOS system UK, restaurant POS UK, EPOS for restaurants, pub EPOS, takeaway EPOS, EPOS Now alternative, best restaurant EPOS UK, VAT EPOS system, allergen menu EPOS',
  alternates: {
    canonical: 'https://www.dineopen.com/uk',
    languages: { 'en-GB': 'https://www.dineopen.com/uk', 'x-default': 'https://www.dineopen.com/uk' },
  },
  openGraph: {
    title: 'Restaurant EPOS System UK | DineOpen',
    description: 'A modern EPOS for UK restaurants & pubs. VAT, allergens, FHRS, Deliveroo/Just Eat/Uber Eats, contactless. From £8/mo, no lock-in.',
    url: 'https://www.dineopen.com/uk',
    siteName: 'DineOpen',
    locale: 'en_GB',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const UK_DATA = {
  slug: 'uk',
  country: 'GB',
  countryName: 'UK',
  flag: '🇬🇧',
  competitors: 'EPOS Now, Lightspeed & Square',
  priceLine: 'from £8/month',
  posLink: '/pos/uk',
  hero: {
    badge: 'Restaurant EPOS for the UK',
    h1: 'The modern EPOS system for UK restaurants',
    sub: 'Cloud EPOS, AI ordering, inventory and analytics — with UK VAT, allergen labelling and Deliveroo/Just Eat built in. A simpler, cheaper alternative to EPOS Now and Lightspeed.',
  },
  stats: [
    { value: '£8/mo', label: 'Starting price' },
    { value: '0%', label: 'Transaction fees' },
    { value: '20%', label: 'VAT handled' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: ['20% VAT with eat-in vs takeaway rates', 'Natasha’s Law allergen info per item', 'FHRS food-hygiene-ready records', 'Making Tax Digital — Xero export'],
  payments: ['Chip & PIN + contactless', 'Apple Pay & Google Pay', 'Visa, Mastercard & Amex', 'Split bills, service charge & tronc'],
  delivery: ['Deliveroo, Just Eat & Uber Eats', 'Direct QR-code & online ordering', 'Kitchen display & KOT printing', 'Xero accounting export'],
  verticals: [
    { name: 'Pubs & Breweries', href: '/for/pubs-breweries', desc: 'Tabs & table service' },
    { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Fast rounds & tronc' },
    { name: 'Cafes & Coffee', href: '/for/cafes', desc: 'Counter service' },
    { name: 'Indian Takeaways', href: '/for/qsr', desc: 'Collection & delivery' },
    { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Coursing & seat maps' },
    { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile & offline' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only' },
    { name: 'Bakeries', href: '/for/bakeries', desc: 'Counter + pre-orders' },
  ],
  locations: [
    { name: 'London', href: '/uk/london' },
    { name: 'Manchester', href: '/uk/manchester' },
    { name: 'Birmingham', href: '/uk/birmingham' },
  ],
  guides: [
    { name: 'Best Restaurant POS/EPOS in the UK (2026)', href: '/blog/best-restaurant-pos-uk-2026', desc: 'Compared for UK venues' },
    { name: 'Best EPOS for Pubs (2026)', href: '/blog/best-pos-system-pubs-uk-2026', desc: 'Tabs, tronc, table service' },
    { name: 'Best EPOS for Indian Takeaways', href: '/blog/best-epos-indian-takeaway-uk-2026', desc: 'Collection & delivery' },
    { name: 'How to Open a Restaurant in the UK', href: '/blog/how-to-open-restaurant-uk-2026', desc: 'Licences, costs & steps' },
    { name: 'UK Restaurant Business Rates', href: '/blog/restaurant-business-rates-uk-2026', desc: 'What you’ll pay' },
    { name: 'Free QR Code Menu for UK Restaurants', href: '/blog/free-qr-code-menu-uk-restaurants', desc: 'Free tool + guide' },
    { name: 'DineOpen vs Square', href: '/vs/dineopen-vs-square', desc: 'Side-by-side comparison' },
    { name: 'UK VAT Calculator', href: '/tools/vat-calculator', desc: 'Free tool' },
    { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Free tool' },
  ],
  faqs: [
    { q: 'What is the best EPOS system for UK restaurants?', a: 'DineOpen is a modern cloud EPOS for UK restaurants, pubs and takeaways with 20% VAT handling (eat-in vs takeaway rates), Natasha’s Law allergen labelling, FHRS-ready records, and Deliveroo/Just Eat/Uber Eats integrations — from £8/month with no transaction fees or lock-in, making it a simpler alternative to EPOS Now and Lightspeed.' },
    { q: 'Does DineOpen handle UK VAT and allergens?', a: 'Yes. DineOpen applies the correct 20% VAT with separate eat-in and takeaway rates, exports Making Tax Digital data to Xero, and lets you display Natasha’s Law allergen information for every menu item.' },
    { q: 'Which UK delivery apps and payments are supported?', a: 'DineOpen integrates with Deliveroo, Just Eat and Uber Eats, and accepts chip & PIN, contactless, Apple Pay and Google Pay, with split bills, service charge and tronc handling.' },
    { q: 'How much does a DineOpen EPOS cost in the UK?', a: 'Plans start at £8/month with zero transaction fees and no long contracts, plus a free trial with no card required.' },
  ],
};

export default function UKHubPage() {
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DineOpen — Restaurant EPOS (UK)',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: { '@type': 'Offer', price: '8', priceCurrency: 'GBP', availability: 'https://schema.org/InStock' },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <CountryHubClient data={UK_DATA} />
    </>
  );
}
