import KOTSystemClient from './KOTSystemClient';
import { FAQ } from './kotContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/kot-system';

export const metadata = {
  title: 'KOT Format for Restaurants (Free Printable KOT) | DineOpen',
  description: 'Free KOT format maker for restaurants. Add table number, waiter and items with notes, then print a kitchen order ticket on a 58 mm or 80 mm thermal printer or as an A5 KOT book page.',
  keywords: 'kot format, kot format for restaurant, kot format in word, kot book format, simple kot format, kitchen order ticket format, hotel kot format, kot slip',
  openGraph: {
    title: 'KOT Format for Restaurants (Free Printable KOT)',
    description: 'Make and print a kitchen order ticket in 58 mm, 80 mm or A5 KOT book size.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KOT Format for Restaurants (Free Printable KOT)',
    description: 'Make and print a kitchen order ticket in 58 mm, 80 mm or A5 KOT book size.',
  },
  alternates: { canonical: URL },
};

export default function KOTSystemPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'KOT Format Maker',
      description: 'Make a printable kitchen order ticket (KOT) for a restaurant in 58 mm, 80 mm or A5 KOT book size.',
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
        { '@type': 'ListItem', position: 3, name: 'KOT Format', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <KOTSystemClient />
    </>
  );
}
