import CateringClient from './CateringClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Catering Business India | Wedding & Corporate | DineOpen',
  description: 'Best software for catering businesses in India. Wedding catering, corporate events, bulk orders, menu planning, advance bookings, GST invoicing. ₹999/month.',
  keywords: 'catering software India, wedding catering billing, corporate catering POS, bulk order management, caterer billing software, event catering software',
  openGraph: {
    title: 'POS Software for Catering Business India | DineOpen',
    description: 'Best software for caterers with bulk order management, advance bookings, and menu planning.',
    url: 'https://www.dineopen.com/for/catering',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/catering' },
};

export default function CateringPage() {
  return <CateringClient />;
}
