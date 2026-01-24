import QRMenuGeneratorClient from './QRMenuGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free QR Menu Generator for Restaurants India | DineOpen',
  description: 'Create free QR code menus for your restaurant. Digital menu with photos, prices, variants. Customers scan and order instantly. No app download needed.',
  keywords: 'QR menu generator India, digital menu restaurant, QR code menu free, contactless menu, restaurant QR ordering, scan and order menu',
  openGraph: {
    title: 'Free QR Menu Generator for Restaurants India | DineOpen',
    description: 'Create free QR code menus for your restaurant with photos, prices, and instant ordering.',
    url: 'https://www.dineopen.com/tools/qr-menu-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/qr-menu-generator',
  },
};

export default function QRMenuGeneratorPage() {
  return <QRMenuGeneratorClient />;
}
