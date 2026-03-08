import QRMenuGeneratorClient from './QRMenuGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free QR Menu Maker & Generator for Restaurants [No Login] | DineOpen',
  description: 'Free QR menu maker for restaurants — create digital menus with photos, prices & variants in 2 minutes. Customers scan and order instantly. No app download, no signup. 5 beautiful themes.',
  keywords: 'free qr menu maker, QR menu generator, QR menu maker free, digital menu restaurant, QR code menu free, contactless menu, restaurant QR ordering, scan and order menu, qr menu maker online free, restaurant qr code generator, free digital menu for restaurant',
  openGraph: {
    title: 'Free QR Menu Maker & Generator for Restaurants [No Login] | DineOpen',
    description: 'Create free QR code menus for your restaurant with photos, prices, and instant ordering. No signup needed.',
    url: 'https://www.dineopen.com/tools/qr-menu-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free QR Menu Maker for Restaurants [No Login] | DineOpen',
    description: 'Create QR menus with photos & prices in 2 min. 5 themes, no app needed. Free.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/qr-menu-generator',
  },
};

export default function QRMenuGeneratorPage() {
  return <QRMenuGeneratorClient />;
}
