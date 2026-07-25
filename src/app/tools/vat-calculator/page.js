import VatCalculatorClient from './VatCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'UK VAT Calculator for Restaurants | Add & Remove VAT | DineOpen',
  description: 'Free UK VAT calculator. Add or remove 20%, 5% or 0% VAT and see net, VAT and gross instantly. Built for restaurants, pubs & takeaways — with eat-in vs takeaway guidance.',
  keywords: 'VAT calculator, UK VAT calculator, restaurant VAT calculator, add VAT calculator, remove VAT calculator, 20% VAT calculator, takeaway VAT calculator, hospitality VAT',
  alternates: { canonical: 'https://www.dineopen.com/tools/vat-calculator' },
  openGraph: {
    title: 'UK VAT Calculator for Restaurants | DineOpen',
    description: 'Add or remove UK VAT instantly. Eat-in vs takeaway guidance for restaurants. Free forever.',
    url: 'https://www.dineopen.com/tools/vat-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'UK VAT Calculator for Restaurants | DineOpen', description: 'Add or remove UK VAT instantly. Free.' },
};

export default function VatCalculatorPage() {
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UK VAT Calculator for Restaurants',
    description: 'Free online UK VAT calculator — add or remove 20%, 5% or 0% VAT for restaurants and takeaways.',
    url: 'https://www.dineopen.com/tools/vat-calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    provider: { '@type': 'Organization', name: 'DineOpen' },
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is the VAT rate for UK restaurants?', acceptedAnswer: { '@type': 'Answer', text: 'The standard UK VAT rate is 20%. Eat-in meals and hot takeaway food are standard-rated at 20%, while most cold takeaway food eaten off the premises is zero-rated at 0%. A reduced 5% rate applies to some supplies.' } },
      { '@type': 'Question', name: 'How do I remove VAT from a gross price?', acceptedAnswer: { '@type': 'Answer', text: 'Divide the gross (VAT-inclusive) amount by 1.20 for the 20% rate to get the net amount, then subtract to find the VAT. For example, £120 gross ÷ 1.20 = £100 net, so the VAT is £20.' } },
      { '@type': 'Question', name: 'Do I charge VAT on takeaway food in the UK?', acceptedAnswer: { '@type': 'Answer', text: 'Hot takeaway food is standard-rated at 20%, but most cold takeaway food is zero-rated. Because the rate depends on eat-in vs takeaway and hot vs cold, an EPOS that applies the right rate per item keeps your VAT return accurate.' } },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VatCalculatorClient />
    </>
  );
}
