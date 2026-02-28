import OnlineOrderingClient from './OnlineOrderingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Online Ordering System for Restaurants | DineOpen',
  description: 'Let customers order from their phones with QR code menus, digital ordering, and multiple payment options. No app download required. Setup in minutes.',
  keywords: 'online ordering system, QR code ordering, restaurant digital menu, contactless ordering, mobile ordering for restaurants',
  openGraph: {
    title: 'Online Ordering System | DineOpen',
    description: 'QR code menus, digital ordering, and multiple payment options. No app download required.',
    url: 'https://www.dineopen.com/features/online-ordering',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Ordering System | DineOpen',
    description: 'QR code menus, digital ordering, and multiple payment options. No app download required.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/online-ordering',
  },
};

export default function OnlineOrderingPage() {
  return <OnlineOrderingClient />;
}
