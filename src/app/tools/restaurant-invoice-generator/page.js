import InvoiceGeneratorClient from './InvoiceGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Invoice & Bill Generator India | DineOpen',
  description: 'Generate GST-compliant restaurant invoices and bills for free. Automatic tax calculation, multiple payment modes, digital receipts via WhatsApp.',
  keywords: 'restaurant invoice generator India, GST bill generator restaurant, restaurant billing software free, food bill maker, restaurant receipt generator',
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
