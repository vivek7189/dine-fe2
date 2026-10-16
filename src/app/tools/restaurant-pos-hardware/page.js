import HardwareKitClient from './HardwareKitClient';
import { FAQ } from './hardwareContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/restaurant-pos-hardware';

export const metadata = {
  title: 'Restaurant POS Machine & Hardware: Kit Builder with Prices',
  description: 'Free restaurant POS hardware kit builder. Pick your type of business and see what to buy (billing device, receipt and kitchen printers, cash drawer, kitchen display, scanner, scale) with typical prices in your currency.',
  keywords: 'restaurant pos machine, pos machine for restaurant, restaurant pos hardware, pos machine for restaurant price, billing machine for restaurant, restaurant printer, kitchen printer, cash drawer',
  openGraph: {
    title: 'Restaurant POS Hardware Kit Builder',
    description: 'See exactly what hardware your restaurant needs and what it costs. Or start with the phone you have.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS Hardware Kit Builder',
    description: 'See exactly what hardware your restaurant needs and what it costs.',
  },
  alternates: { canonical: URL },
};

export default function RestaurantPosHardwarePage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Restaurant POS Hardware Kit Builder',
      description: 'Build a restaurant POS hardware list with typical prices for your type of business.',
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
        { '@type': 'ListItem', position: 3, name: 'Restaurant POS Hardware', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HardwareKitClient />
    </>
  );
}
