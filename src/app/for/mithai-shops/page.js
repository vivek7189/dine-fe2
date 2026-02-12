import MithaiShopsClient from './MithaiShopsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Mithai Shops | Indian Sweets Billing | DineOpen',
  description: 'Best POS software for mithai shops and Indian sweet stores. Weight-based billing, festival rush handling, box/gift packing. Perfect for halwai shops, Bengali sweets, and South Indian sweets.',
  keywords: 'mithai shop POS, Indian sweets billing software, halwai shop software, sweet shop POS, Bengali sweets billing, ladoo shop software, barfi billing software',
  openGraph: {
    title: 'POS Software for Mithai Shops | DineOpen',
    description: 'Specialized POS for mithai shops with weight-based billing and festival rush management.',
    url: 'https://www.dineopen.com/for/mithai-shops',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/mithai-shops',
  },
};

export default function MithaiShopsPage() {
  return <MithaiShopsClient />;
}
