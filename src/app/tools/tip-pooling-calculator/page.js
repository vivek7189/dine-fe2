import TipPoolingClient from './TipPoolingClient';
import { FAQ } from './tipPoolContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/tip-pooling-calculator';

export const metadata = {
  title: 'Tip Pooling Calculator: Split Tips by Hours & Role (Free)',
  description: 'Free tip pooling calculator for restaurants. Share tips between servers, bartenders, bussers and kitchen staff by hours worked, role points or equally. Payouts add up to the cent. Includes US and UK tip rules.',
  keywords: 'tip pooling calculator, tip pool calculator, tip out calculator, how to split tips, tip distribution calculator, restaurant tip sharing, tip pooling rules',
  openGraph: {
    title: 'Tip Pooling Calculator: Split Tips by Hours & Role',
    description: 'Share the night’s tips fairly between restaurant staff. Payouts add up to the cent.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tip Pooling Calculator for Restaurants',
    description: 'Share tips fairly by hours worked, role points or equally.',
  },
  alternates: { canonical: URL },
};

export default function TipPoolingCalculatorPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Tip Pooling Calculator',
      description: 'Share restaurant tips between staff by hours worked, hours and role points, or equally.',
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
        { '@type': 'ListItem', position: 2, name: 'Tip Pooling Calculator', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TipPoolingClient />
    </>
  );
}
