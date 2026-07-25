import SalesTaxCalculatorClient from './SalesTaxCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'US Sales Tax Calculator for Restaurants | By State | DineOpen',
  description: 'Free US restaurant sales tax calculator. Pick your state, add local city/county rate, and get the exact tax and total instantly. Covers all 50 states + DC. Perfect for restaurants, bars & cafes.',
  keywords: 'sales tax calculator, restaurant sales tax calculator, US sales tax by state, food sales tax calculator, state sales tax calculator, restaurant tax calculator USA, meals tax calculator',
  alternates: { canonical: 'https://www.dineopen.com/tools/sales-tax-calculator' },
  openGraph: {
    title: 'US Sales Tax Calculator for Restaurants | DineOpen',
    description: 'Calculate US restaurant sales tax by state instantly. All 50 states + local rates. Free forever.',
    url: 'https://www.dineopen.com/tools/sales-tax-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'US Sales Tax Calculator for Restaurants | DineOpen', description: 'Calculate US restaurant sales tax by state instantly. Free.' },
};

export default function SalesTaxCalculatorPage() {
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'US Restaurant Sales Tax Calculator',
    description: 'Free online US sales tax calculator for restaurants — by state, with local rates.',
    url: 'https://www.dineopen.com/tools/sales-tax-calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: 'DineOpen' },
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How do I calculate US restaurant sales tax?', acceptedAnswer: { '@type': 'Answer', text: 'Multiply the pre-tax amount by the combined sales-tax rate (state base rate plus any local city/county rate), then add it to the subtotal. For example, a $100 check in California (7.25% base) with a 1.5% local rate = $100 × 8.75% = $8.75 tax, for a $108.75 total.' } },
      { '@type': 'Question', name: 'Does every US state charge sales tax on restaurant food?', acceptedAnswer: { '@type': 'Answer', text: 'No. Five states have no statewide sales tax — Alaska, Delaware, Montana, New Hampshire and Oregon — though Alaska allows local sales taxes. Most other states tax prepared restaurant food, and some apply special meals taxes on top.' } },
      { '@type': 'Question', name: 'What is the difference between state and local sales tax?', acceptedAnswer: { '@type': 'Answer', text: 'The state base rate is set statewide; cities and counties can add local rates on top. A POS like DineOpen applies the correct combined rate automatically by location so you never have to look it up.' } },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SalesTaxCalculatorClient />
    </>
  );
}
