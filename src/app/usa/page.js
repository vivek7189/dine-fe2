import CountryHubClient from '../CountryHubClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System USA | Toast & Square Alternative | DineOpen',
  description: 'Modern restaurant POS for US restaurants — state sales tax, IRS tip reporting, ADA-ready, DoorDash/Uber Eats/Grubhub, Apple Pay & tap-to-pay. Zero transaction fees, no contracts. A cheaper Toast & Square alternative from $10/mo.',
  keywords: 'restaurant POS USA, restaurant POS system, best restaurant POS, Toast alternative, Square alternative, free restaurant POS USA, restaurant point of sale, US restaurant software, POS with sales tax',
  alternates: {
    canonical: 'https://www.dineopen.com/usa',
    languages: { 'en-US': 'https://www.dineopen.com/usa', 'x-default': 'https://www.dineopen.com/usa' },
  },
  openGraph: {
    title: 'Restaurant POS System USA | DineOpen',
    description: 'A modern Toast & Square alternative for US restaurants. Sales tax, tip reporting, ADA-ready, delivery integrations. Zero transaction fees from $10/mo.',
    url: 'https://www.dineopen.com/usa',
    siteName: 'DineOpen',
    locale: 'en_US',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const USA_DATA = {
  slug: 'usa',
  country: 'US',
  countryName: 'US',
  flag: '🇺🇸',
  competitors: 'Toast, Square & Clover',
  priceLine: 'from $10/month',
  posLink: '/pos/usa',
  hero: {
    badge: 'Restaurant POS for the USA',
    h1: 'The modern restaurant POS for US restaurants',
    sub: 'Cloud POS, AI ordering, inventory and analytics — with US sales tax, tip reporting and delivery built in. Switch from Toast or Square without the hardware lock-in.',
  },
  stats: [
    { value: '$10/mo', label: 'Starting price' },
    { value: '0%', label: 'Transaction fees' },
    { value: '50', label: 'States: sales tax' },
    { value: '5 min', label: 'Setup' },
  ],
  compliance: ['State & local sales tax (all 50 states)', 'IRS tip reporting (Form 8027 ready)', 'ADA-compliant ordering & receipts', 'Month-to-month — no long contracts'],
  payments: ['Visa, Mastercard, Amex & Discover', 'Apple Pay & Google Pay (tap-to-pay)', 'Cash App Pay & Venmo', 'Split checks, tips & pre-auth tabs'],
  delivery: ['DoorDash, Uber Eats & Grubhub', 'ChowNow & direct online ordering', 'QR-code dine-in ordering', 'QuickBooks & Xero export'],
  verticals: [
    { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Tabs, pre-auth, tip-out' },
    { name: 'Cafes & Coffee', href: '/for/cafes', desc: 'Fast counter service' },
    { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile, offline-ready' },
    { name: 'QSR & Fast Casual', href: '/for/qsr', desc: 'Speed of service' },
    { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Coursing & seat maps' },
    { name: 'Pizza Shops', href: '/for/pizza-shops', desc: 'Modifiers & delivery' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only ops' },
    { name: 'Bakeries', href: '/for/bakeries', desc: 'Counter + pre-orders' },
  ],
  locations: [
    { name: 'California', href: '/usa/california' },
    { name: 'Texas', href: '/usa/texas' },
    { name: 'New York', href: '/usa/new-york' },
    { name: 'Florida', href: '/usa/florida' },
  ],
  guides: [
    { name: 'Best Free Restaurant POS in the USA (2026)', href: '/blog/best-free-restaurant-pos-usa-2026', desc: 'Compared: Toast, Square, Clover & more' },
    { name: 'Toast POS Alternatives (2026)', href: '/blog/toast-pos-alternatives-2026', desc: 'Cheaper, no-lock-in options' },
    { name: 'US Restaurant Sales Tax Guide', href: '/blog/restaurant-sales-tax-guide-usa-2026', desc: 'By state, on the POS' },
    { name: 'Tipping Guide (US/Canada/UK)', href: '/blog/tipping-guide-usa-canada-uk-2026', desc: 'Tip credit & pooling rules' },
    { name: 'DineOpen vs Toast', href: '/vs/dineopen-vs-toast', desc: 'Side-by-side comparison' },
    { name: 'US Sales Tax Calculator', href: '/tools/sales-tax-calculator', desc: 'Free tool' },
    { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Free tool' },
    { name: 'Tip Calculator', href: '/tools/tip-calculator', desc: 'Free tool' },
    { name: 'Restaurant Startup Cost Calculator', href: '/tools/startup-cost-calculator', desc: 'Free tool' },
  ],
  faqs: [
    { q: 'Is DineOpen a good Toast or Square alternative for US restaurants?', a: 'Yes. DineOpen offers cloud POS, AI ordering, inventory and analytics with US sales tax, tip reporting and DoorDash/Uber Eats/Grubhub integrations — with zero transaction fees, no hardware lock-in and month-to-month pricing from $10/month, versus Toast’s hardware contracts and per-transaction fees.' },
    { q: 'Does DineOpen handle US sales tax and tips?', a: 'Yes. DineOpen calculates state and local sales tax for all 50 states, supports tip lines, tip pooling and Form 8027 tip reporting, and prints ADA-compliant receipts.' },
    { q: 'Which payments and delivery apps work in the US?', a: 'DineOpen supports Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Cash App Pay and Venmo, plus DoorDash, Uber Eats, Grubhub and ChowNow, and direct QR-code ordering.' },
    { q: 'How much does DineOpen cost in the US?', a: 'Plans start at $10/month with zero transaction fees and no long-term contracts. There is a free trial with no credit card required.' },
  ],
};

export default function USAHubPage() {
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DineOpen — Restaurant POS (USA)',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: { '@type': 'Offer', price: '10', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <CountryHubClient data={USA_DATA} />
    </>
  );
}
