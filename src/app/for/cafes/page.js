import CafesClient from './CafesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Cafes & Coffee Shops India | DineOpen',
  description: 'Best POS software for cafes and coffee shops in India. QR ordering, quick billing, loyalty programs, inventory tracking. Perfect for coffee shops and bakery cafes.',
  keywords: 'cafe POS India, coffee shop billing software, cafe management system, quick service POS, bakery cafe software India',
  openGraph: {
    title: 'POS Software for Cafes & Coffee Shops India | DineOpen',
    description: 'Best POS software for cafes and coffee shops in India with quick billing and loyalty programs.',
    url: 'https://www.dineopen.com/for/cafes',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/cafes',
  },
};

export default function CafesPage() {
  return <CafesClient />;
}
