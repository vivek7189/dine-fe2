import ProfitCalculatorClient from './ProfitCalculatorClient';
import { FAQ } from './profitContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/food-business-profit-calculator';

export const metadata = {
  title: 'Food Business Profit Calculator (India): Monthly Profit',
  description: 'Free profit calculator for cafés, cloud kitchens, bakeries, tiffin services, food trucks and restaurants in India. See monthly revenue, every cost, net margin and how many months to recover your setup cost.',
  keywords: 'food business profit calculator, restaurant profit calculator india, cafe profit calculator, cloud kitchen profit calculator, tiffin service profit, food truck profit india, bakery profit calculator, restaurant net profit margin',
  openGraph: {
    title: 'Food Business Profit Calculator (India)',
    description: 'Pick your format, adjust the numbers, and see what you keep each month.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Business Profit Calculator (India)',
    description: 'Pick your format, adjust the numbers, and see what you keep each month.',
  },
  alternates: { canonical: URL },
};

export default function FoodBusinessProfitCalculatorPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Food Business Profit Calculator (India)',
      description: 'Estimate monthly revenue, costs, net profit margin and setup payback for a café, cloud kitchen, bakery, tiffin service, food truck or restaurant in India.',
      url: URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
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
        { '@type': 'ListItem', position: 3, name: 'Food Business Profit Calculator', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProfitCalculatorClient />
    </>
  );
}
