import CountryHubClient from '../CountryHubClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System Canada | GST/HST & Bilingual | DineOpen',
  description: 'Modern restaurant POS for Canadian restaurants — GST/HST + QST (Quebec), Bill 72 tipping, bilingual (French) receipts, Interac, Apple Pay, SkipTheDishes/Uber Eats/DoorDash. Zero transaction fees, no lock-in. A Lightspeed & TouchBistro alternative from C$14/mo.',
  keywords: 'restaurant POS Canada, best restaurant POS Canada, Lightspeed alternative, TouchBistro alternative, restaurant POS Ontario, POS Quebec, GST HST POS, bilingual restaurant POS, Canadian restaurant software',
  alternates: {
    canonical: 'https://www.dineopen.com/canada',
    languages: { 'en-CA': 'https://www.dineopen.com/canada', 'x-default': 'https://www.dineopen.com/canada' },
  },
  openGraph: {
    title: 'Restaurant POS System Canada | DineOpen',
    description: 'A modern Lightspeed & TouchBistro alternative for Canadian restaurants. GST/HST/QST, bilingual receipts, SkipTheDishes/Uber Eats/DoorDash. From C$14/mo.',
    url: 'https://www.dineopen.com/canada',
    siteName: 'DineOpen',
    locale: 'en_CA',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const CANADA_DATA = {
  slug: 'canada',
  country: 'CA',
  countryName: 'Canada',
  flag: '🇨🇦',
  competitors: 'Lightspeed, TouchBistro & Square',
  priceLine: 'from C$14/month',
  posLink: '/pos/canada',
  hero: {
    badge: 'Restaurant POS for Canada',
    h1: 'The modern restaurant POS for Canadian restaurants',
    sub: 'Cloud POS, AI ordering, inventory and analytics — with GST/HST/QST, bilingual receipts and SkipTheDishes built in. A cheaper, no-lock-in alternative to Lightspeed and TouchBistro.',
  },
  stats: [
    { value: 'C$14/mo', label: 'Starting price' },
    { value: '0%', label: 'Transaction fees' },
    { value: 'GST/HST', label: '+ QST (Quebec)' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: ['GST/HST nationwide + QST for Quebec', 'Quebec Bill 72 tipping (pre-tax) ready', 'Bilingual English/French receipts', 'Month-to-month — no long contracts'],
  payments: ['Interac Debit & tap', 'Visa, Mastercard & Amex', 'Apple Pay & Google Pay', 'Split bills, tips & pre-auth tabs'],
  delivery: ['SkipTheDishes, Uber Eats & DoorDash', 'Direct QR-code & online ordering', 'Kitchen display & KOT printing', 'QuickBooks & Xero export'],
  verticals: [
    { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Tabs & tip-out' },
    { name: 'Pubs & Breweries', href: '/for/pubs-breweries', desc: 'Taproom service' },
    { name: 'Cafes & Coffee', href: '/for/cafes', desc: 'Counter service' },
    { name: 'QSR & Fast Casual', href: '/for/qsr', desc: 'Speed of service' },
    { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Coursing & seat maps' },
    { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile & offline' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only' },
    { name: 'Bakeries', href: '/for/bakeries', desc: 'Counter + pre-orders' },
  ],
  locations: [
    { name: 'Ontario', href: '/canada/ontario' },
    { name: 'Quebec', href: '/canada/quebec' },
    { name: 'British Columbia', href: '/canada/british-columbia' },
    { name: 'Alberta', href: '/canada/alberta' },
  ],
  guides: [
    { name: 'Best Restaurant POS in Canada (2026)', href: '/blog/best-restaurant-pos-canada-2026', desc: 'Compared for Canadian venues' },
    { name: 'How to Open a Restaurant in Canada', href: '/blog/how-to-open-restaurant-canada-2026', desc: 'Licences, costs & steps' },
    { name: 'Delivery Commission Comparison (Canada)', href: '/blog/food-delivery-commission-comparison-canada-2026', desc: 'SkipTheDishes vs Uber Eats vs DoorDash' },
    { name: 'Restaurant Grants & Funding (Canada)', href: '/blog/restaurant-grants-funding-canada-2026', desc: 'Where to get funding' },
    { name: 'Tipping Guide (US/Canada/UK)', href: '/blog/tipping-guide-usa-canada-uk-2026', desc: 'Bill 72 & pooling rules' },
    { name: 'DineOpen vs Lightspeed', href: '/vs/dineopen-vs-lightspeed', desc: 'Side-by-side comparison' },
    { name: 'Canada GST/HST Calculator', href: '/tools/gst-hst-calculator', desc: 'Free tool' },
    { name: 'TouchBistro Alternatives', href: '/alternatives/touchbistro', desc: 'Cheaper options' },
    { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Free tool' },
  ],
  faqs: [
    { q: 'What is the best restaurant POS in Canada?', a: 'DineOpen is a modern cloud POS for Canadian restaurants with GST/HST and Quebec QST handling, Bill 72 pre-tax tipping, bilingual English/French receipts, and SkipTheDishes/Uber Eats/DoorDash integrations — from C$14/month with zero transaction fees and no lock-in, making it a cheaper alternative to Lightspeed and TouchBistro.' },
    { q: 'Does DineOpen handle GST/HST and Quebec QST?', a: 'Yes. DineOpen calculates GST/HST by province and the additional QST for Quebec, supports Quebec’s Bill 72 pre-tax tip presentation, and prints bilingual English/French receipts.' },
    { q: 'Which Canadian delivery apps and payments are supported?', a: 'DineOpen integrates with SkipTheDishes, Uber Eats and DoorDash, and accepts Interac Debit, Visa, Mastercard, Amex, Apple Pay and Google Pay, with split bills and tips.' },
    { q: 'How much does DineOpen cost in Canada?', a: 'Plans start at C$14/month with zero transaction fees and no long contracts, plus a free trial with no credit card required.' },
  ],
};

export default function CanadaHubPage() {
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DineOpen — Restaurant POS (Canada)',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: { '@type': 'Offer', price: '14', priceCurrency: 'CAD', availability: 'https://schema.org/InStock' },
    areaServed: { '@type': 'Country', name: 'Canada' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <CountryHubClient data={CANADA_DATA} />
    </>
  );
}
