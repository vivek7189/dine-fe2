import { FAQ } from './billFormatContent';
import InvoiceGeneratorClient from './InvoiceGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Bill Generator & Food Bill Maker (GST, PDF) | DineOpen',
  description: 'Make a restaurant or food bill online in a minute. Add items, GST (CGST/SGST), discount and your logo, then download the PDF or print it. Free, no signup.',
  keywords: 'restaurant invoice generator India, GST bill generator restaurant, restaurant billing software free, food bill maker, restaurant receipt generator, restaurant invoice PDF download, restaurant bill with logo',
  openGraph: {
    title: 'Free Restaurant Bill Generator & Food Bill Maker (GST, PDF) | DineOpen',
    description: 'Make a restaurant or food bill with GST and your logo. Download PDF or print. Free, no signup.',
    url: 'https://www.dineopen.com/tools/restaurant-invoice-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/restaurant-invoice-generator',
  },
};

export default function InvoiceGeneratorPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <InvoiceGeneratorClient />
    </>
  );
}
