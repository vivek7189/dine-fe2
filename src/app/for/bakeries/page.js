import BakeriesClient from './BakeriesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Bakeries India | DineOpen',
  description: 'Best POS software for bakeries and sweet shops in India. Order management, GST billing, inventory tracking, custom cake orders, loyalty programs.',
  keywords: 'bakery POS India, sweet shop billing software, bakery management system, confectionery POS, mithai shop software India',
  openGraph: {
    title: 'POS Software for Bakeries India | DineOpen',
    description: 'Best POS software for bakeries and sweet shops in India with order management and GST billing.',
    url: 'https://www.dineopen.com/for/bakeries',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/bakeries',
  },
};

export default function BakeriesPage() {
  return <BakeriesClient />;
}
