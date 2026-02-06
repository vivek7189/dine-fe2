import SweetShopsClient from './SweetShopsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Sweet Shops & Mithai Stores India | DineOpen',
  description: 'Best POS for sweet shops, mithai stores, namkeen shops & halwai in India. Weight-based billing, festival rush management, box packaging, GST invoicing. ₹999/month.',
  keywords: 'sweet shop POS India, mithai shop billing software, halwai POS system, namkeen shop software, Indian sweets billing, weight based billing POS',
  openGraph: {
    title: 'POS Software for Sweet Shops & Mithai Stores India | DineOpen',
    description: 'Best POS for sweet shops with weight-based billing, festival rush management, and GST invoicing.',
    url: 'https://www.dineopen.com/for/sweet-shops',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/sweet-shops' },
};

export default function SweetShopsPage() {
  return <SweetShopsClient />;
}
