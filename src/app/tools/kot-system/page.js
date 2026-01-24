import KOTSystemClient from './KOTSystemClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free KOT System for Restaurant Kitchen India | DineOpen',
  description: 'Digital Kitchen Order Ticket (KOT) system for restaurants. Real-time orders to kitchen, status tracking, thermal printing. Reduce errors and speed up service.',
  keywords: 'KOT system India, kitchen order ticket software, restaurant kitchen display, KOT printer software, digital KOT system, kitchen management restaurant',
  openGraph: {
    title: 'Free KOT System for Restaurant Kitchen India | DineOpen',
    description: 'Digital Kitchen Order Ticket system with real-time orders and thermal printing.',
    url: 'https://www.dineopen.com/tools/kot-system',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/kot-system',
  },
};

export default function KOTSystemPage() {
  return <KOTSystemClient />;
}
