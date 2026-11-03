import EquipmentListClient from './EquipmentListClient';
import { FAQ } from './equipmentContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/restaurant-kitchen-equipment-list';

export const metadata = {
  title: 'Restaurant Kitchen Equipment List with Price (India, 2026)',
  description: 'Free checklist of restaurant kitchen equipment with typical Indian prices for a café, QSR, cloud kitchen, bakery or dhaba. Tick what you need, change quantities, see the total and download it as a PDF.',
  keywords: 'restaurant kitchen equipment list with price, commercial kitchen equipment list india, cafe equipment list with price, cloud kitchen equipment list, bakery equipment list price, restaurant kitchen equipment list pdf, cafe setup cost india',
  openGraph: {
    title: 'Restaurant Kitchen Equipment List with Price (India)',
    description: 'Pick your kind of food business and get a full equipment list with typical prices. Print it or send it on WhatsApp.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Kitchen Equipment List with Price (India)',
    description: 'Pick your kind of food business and get a full equipment list with typical prices.',
  },
  alternates: { canonical: URL },
};

export default function KitchenEquipmentListPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Restaurant Kitchen Equipment List with Price (India)',
      description: 'Equipment checklist with typical Indian prices for a café, QSR, cloud kitchen, bakery or dhaba, with live totals and a printable list.',
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
        { '@type': 'ListItem', position: 3, name: 'Kitchen Equipment List', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <EquipmentListClient />
    </>
  );
}
