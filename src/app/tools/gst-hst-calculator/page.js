import GstHstCalculatorClient from './GstHstCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Canada GST/HST Calculator for Restaurants | By Province | DineOpen',
  description: 'Free Canada GST/HST calculator. Add or remove GST, HST or Quebec QST on restaurant meals by province. Covers Ontario 13%, Quebec GST+QST, Alberta 5% and all provinces. Free forever.',
  keywords: 'GST HST calculator, Canada sales tax calculator, restaurant GST calculator, HST calculator Ontario, QST calculator Quebec, Canada meal tax calculator, provincial tax calculator',
  alternates: { canonical: 'https://www.dineopen.com/tools/gst-hst-calculator' },
  openGraph: {
    title: 'Canada GST/HST Calculator for Restaurants | DineOpen',
    description: 'Add or remove GST/HST/QST by province instantly. Built for Canadian restaurants. Free forever.',
    url: 'https://www.dineopen.com/tools/gst-hst-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Canada GST/HST Calculator for Restaurants | DineOpen', description: 'Add or remove GST/HST/QST by province instantly. Free.' },
};

export default function GstHstCalculatorPage() {
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Canada GST/HST Calculator for Restaurants',
    description: 'Free online Canada GST/HST/QST calculator for restaurants — by province.',
    url: 'https://www.dineopen.com/tools/gst-hst-calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    provider: { '@type': 'Organization', name: 'DineOpen' },
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is the GST/HST rate on restaurant meals in Canada?', acceptedAnswer: { '@type': 'Answer', text: 'It depends on the province: 5% GST in Alberta, BC, Saskatchewan, Manitoba and the territories; 13% HST in Ontario; 15% HST in New Brunswick, Newfoundland & Labrador and PEI; 14% HST in Nova Scotia; and 5% GST + 9.975% QST (about 14.975%) in Quebec.' } },
      { '@type': 'Question', name: 'Does Quebec charge QST as well as GST on restaurant food?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Quebec applies the 5% federal GST plus a 9.975% provincial QST, for roughly 14.975% total. Quebec also requires bilingual French receipts and Bill 72 pre-tax tip presentation.' } },
      { '@type': 'Question', name: 'How do I remove GST/HST from a total?', acceptedAnswer: { '@type': 'Answer', text: 'Divide the tax-inclusive total by 1 plus the rate. For example, in Ontario (13% HST): C$113 ÷ 1.13 = C$100 net, so the tax is C$13.' } },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <GstHstCalculatorClient />
    </>
  );
}
