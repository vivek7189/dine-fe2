import QSRClient from './QSRClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for QSR & Fast Food | Quick Service Restaurants | DineOpen',
  description: 'Best POS for QSR and fast food restaurants. Speed-optimized billing, combo meals, self-ordering kiosks, drive-thru support. Handle high-volume orders efficiently.',
  keywords: 'QSR POS, quick service restaurant software, fast food POS, self ordering kiosk, drive thru POS, fast casual POS, burger shop software, QSR billing India',
  openGraph: {
    title: 'POS Software for QSR & Fast Food | DineOpen',
    description: 'Speed-optimized POS for quick service restaurants with combo meals, self-ordering, and high-volume billing.',
    url: 'https://www.dineopen.com/for/qsr',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/qsr',
  },
};

export default function QSRPage() {
  return <QSRClient />;
}
