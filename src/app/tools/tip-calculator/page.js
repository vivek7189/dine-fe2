import TipCalculatorClient from './TipCalculatorClient';
import { FAQ } from './tipContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/tip-calculator';

export const metadata = {
  title: 'Tip Calculator: Split the Bill, Round Up & Tip Chart (Free)',
  description: 'Free tip calculator. Pick 15%, 18%, 20% or any tip, split the bill between friends, round up to an even amount and tip on the pre-tax total. Includes a US and world tipping guide.',
  keywords: 'tip calculator, restaurant tip calculator, split bill tip calculator, how much to tip, tip chart, gratuity calculator, tip percentage calculator',
  openGraph: {
    title: 'Tip Calculator: Split the Bill & Round Up',
    description: 'Work out the tip, split the bill and round up in seconds. Includes a tip chart and a tipping guide.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tip Calculator: Split the Bill & Round Up',
    description: 'Work out the tip, split the bill and round up in seconds.',
  },
  alternates: { canonical: URL },
};

export default function TipCalculatorPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Tip Calculator',
      description: 'Calculate the tip, split the bill between people, round up and tip on the pre-tax amount.',
      url: URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@type': 'Organization', name: 'DineOpen', url: 'https://www.dineopen.com' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com' },
        { '@type': 'ListItem', position: 2, name: 'Tip Calculator', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TipCalculatorClient />
    </>
  );
}
