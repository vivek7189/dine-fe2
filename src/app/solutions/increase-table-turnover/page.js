import IncreaseTableTurnoverClient from './IncreaseTableTurnoverClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Increase Restaurant Table Turnover | DineOpen',
  description: 'Boost restaurant revenue by increasing table turnover. Real-time table tracking, faster billing, QR ordering, and turnover analytics with DineOpen POS.',
  keywords: 'table turnover, restaurant seating optimization, faster table service, table management POS, increase restaurant revenue, DineOpen, table tracking',
  openGraph: {
    title: 'Increase Restaurant Table Turnover | DineOpen',
    description: 'Boost restaurant revenue by increasing table turnover. Real-time table tracking, faster billing, QR ordering, and turnover analytics with DineOpen POS.',
    url: 'https://www.dineopen.com/solutions/increase-table-turnover',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Increase Restaurant Table Turnover | DineOpen',
    description: 'Boost restaurant revenue by increasing table turnover. Real-time table tracking, faster billing, QR ordering, and turnover analytics with DineOpen POS.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/increase-table-turnover',
  },
};

export default function IncreaseTableTurnoverPage() {
  return <IncreaseTableTurnoverClient />;
}
