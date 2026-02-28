import KitchenDisplaySystemClient from './KitchenDisplaySystemClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Kitchen Display System (KDS) for Restaurants | DineOpen',
  description: 'Replace paper tickets with a digital kitchen display system. Real-time orders, station routing, timing alerts, and ready notifications for faster service.',
  keywords: 'kitchen display system, KDS software, restaurant kitchen screen, digital kitchen tickets, order routing system, kitchen management',
  openGraph: {
    title: 'Kitchen Display System (KDS) | DineOpen',
    description: 'Replace paper tickets with a digital kitchen display. Real-time orders, station routing, and timing alerts.',
    url: 'https://www.dineopen.com/features/kitchen-display-system',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitchen Display System (KDS) | DineOpen',
    description: 'Replace paper tickets with a digital kitchen display. Real-time orders, station routing, and timing alerts.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/kitchen-display-system',
  },
};

export default function KitchenDisplaySystemPage() {
  return <KitchenDisplaySystemClient />;
}
