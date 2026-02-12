import ChaiTapriClient from './ChaiTapriClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Chai Tapri | Tea Stall Billing | DineOpen',
  description: 'Best POS software for chai tapri and tea stalls. Quick billing, cutting chai tracking, biscuit combos. Perfect for chai cafes, tea lounges, and traditional chai stalls.',
  keywords: 'chai tapri POS, tea stall billing software, chai cafe software, cutting chai billing, tea shop POS, chai lounge software, kadak chai billing',
  openGraph: {
    title: 'POS Software for Chai Tapri | DineOpen',
    description: 'Specialized POS for chai tapris with quick billing and inventory tracking.',
    url: 'https://www.dineopen.com/for/chai-tapri',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/chai-tapri',
  },
};

export default function ChaiTapriPage() {
  return <ChaiTapriClient />;
}
