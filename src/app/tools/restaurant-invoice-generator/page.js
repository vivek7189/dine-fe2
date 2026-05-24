import InvoiceGeneratorClient from './InvoiceGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Invoice & Bill Generator India | DineOpen',
  description: 'Generate GST-compliant restaurant invoices with your logo for free. Download PDF, print, or share — no signup needed. Automatic CGST/SGST split, discount support.',
  keywords: 'restaurant invoice generator India, GST bill generator restaurant, restaurant billing software free, food bill maker, restaurant receipt generator, restaurant invoice PDF download, restaurant bill with logo',
  openGraph: {
    title: 'Free Restaurant Invoice & Bill Generator India | DineOpen',
    description: 'Generate GST-compliant restaurant invoices for free with automatic tax calculation.',
    url: 'https://www.dineopen.com/tools/restaurant-invoice-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/restaurant-invoice-generator',
  },
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGeneratorClient />;
}
