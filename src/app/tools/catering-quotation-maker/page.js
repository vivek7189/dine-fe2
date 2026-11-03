import CateringQuotationClient from './CateringQuotationClient';
import { FAQ } from './quotationContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/catering-quotation-maker';

export const metadata = {
  title: 'Free Catering Quotation Maker: Format with GST (PDF, Word)',
  description: 'Make a catering quotation in a few minutes: menu, per-plate or item rates, staff and counters, GST, advance and terms. Download PDF or Word, print, or send on WhatsApp. Free, no sign-up.',
  keywords: 'catering quotation format, catering quotation sample pdf, catering quotation format in word, catering quotation template, catering quotation india, wedding catering quotation, catering quotation with gst',
  openGraph: {
    title: 'Free Catering Quotation Maker (PDF, Word)',
    description: 'Menu, per-plate rate, extras, GST, advance and terms in one clean quotation.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Catering Quotation Maker (PDF, Word)',
    description: 'Menu, per-plate rate, extras, GST, advance and terms in one clean quotation.',
  },
  alternates: { canonical: URL },
};

export default function CateringQuotationMakerPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Catering Quotation Maker',
      description: 'Make a catering quotation with menu, per-plate or item pricing, extras, GST, advance and terms. Download as PDF or Word.',
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
        { '@type': 'ListItem', position: 3, name: 'Catering Quotation Maker', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CateringQuotationClient />
    </>
  );
}
