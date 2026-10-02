import BillingSoftwareClient from './BillingSoftwareClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Restaurant Billing Software India | GST Billing System | DineOpen',
  description: 'Restaurant billing software with GST support for restaurants in India. Generate compliant invoices, calculate taxes automatically, and maintain tax records. Affordable pricing from ₹899.',
  keywords: 'restaurant billing software, GST billing software, restaurant invoice software, billing system for restaurants, GST compliant billing',
  openGraph: {
    title: 'Restaurant Billing Software India | DineOpen',
    description: 'GST-ready billing software for restaurants in India. Automatic tax calculation and compliant invoice generation.',
    url: 'https://www.dineopen.com/products/billing-software',
  },
};

export default function BillingSoftwarePage() {
  return <BillingSoftwareClient />;
}


