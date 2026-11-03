import DailySalesReportClient from './DailySalesReportClient';
import { FAQ } from './dsrContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/daily-sales-report';

export const metadata = {
  title: 'Daily Sales Report Format (Excel, PDF & WhatsApp) | DineOpen',
  description: 'Free daily sales report format for restaurants, cafés and shops. Fill in today’s sales by cash, UPI, card, Swiggy and Zomato, check the cash drawer, then download Excel, print a PDF or copy it for WhatsApp.',
  keywords: 'daily sales report format, daily sales report format in excel, daily sales report format whatsapp, daily sales report format pdf, restaurant daily sales report, cash closing report, shop daily sales report',
  openGraph: {
    title: 'Daily Sales Report Format (Excel, PDF & WhatsApp)',
    description: 'Fill in today’s sales and cash, then download Excel, print it, or send it on WhatsApp.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Sales Report Format (Excel, PDF & WhatsApp)',
    description: 'Fill in today’s sales and cash, then download Excel, print it, or send it on WhatsApp.',
  },
  alternates: { canonical: URL },
};

export default function DailySalesReportPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Daily Sales Report Format',
      description: 'Make a daily sales report with payment-mode totals and a cash drawer check, and download it as Excel or PDF or send it on WhatsApp.',
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
        { '@type': 'ListItem', position: 3, name: 'Daily Sales Report Format', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <DailySalesReportClient />
    </>
  );
}
