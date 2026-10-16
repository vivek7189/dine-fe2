import FoodCostCalculatorClient from './FoodCostCalculatorClient';
import { FAQ } from './foodCostContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/food-cost-calculator';

export const metadata = {
  title: 'Food Cost Calculator & Menu Price Calculator for Restaurants',
  description: 'Free restaurant food cost calculator. Add ingredients in any unit, get the cost per plate, food cost % and the menu price that hits your target. Includes weekly food cost %, benchmarks and the formula.',
  keywords: 'food cost calculator, restaurant food cost calculator, menu price calculator, menu pricing calculator, food cost percentage calculator, plate cost calculator, food cost formula',
  openGraph: {
    title: 'Food Cost Calculator & Menu Price Calculator',
    description: 'Cost per plate, food cost % and the right menu price for every dish. Free, no sign-up.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Cost Calculator & Menu Price Calculator',
    description: 'Cost per plate, food cost % and the right menu price for every dish.',
  },
  alternates: {
    canonical: URL,
    languages: {
      en: URL,
      hi: 'https://www.dineopen.com/hi/tools/food-cost-calculator',
    },
  },
};

export default function FoodCostCalculatorPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Food Cost Calculator',
      description: 'Work out the cost per plate, food cost percentage and menu price for a dish from its ingredients.',
      url: URL,
      applicationCategory: 'BusinessApplication',
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
        { '@type': 'ListItem', position: 2, name: 'Free Tools', item: 'https://www.dineopen.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Food Cost Calculator', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <FoodCostCalculatorClient />
    </>
  );
}
