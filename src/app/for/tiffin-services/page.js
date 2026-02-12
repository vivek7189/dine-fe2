import TiffinServicesClient from './TiffinServicesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Tiffin Services | Subscription Management | DineOpen',
  description: 'Best billing software for tiffin services in India. Manage subscriptions, meal plans, delivery routes, and customer payments. Built for dabba services.',
  keywords: 'tiffin service software, dabba service billing, tiffin subscription management, meal subscription software, tiffin delivery software, lunch box delivery software',
  openGraph: {
    title: 'POS Software for Tiffin Services | DineOpen',
    description: 'Manage tiffin subscriptions, deliveries, and billing with DineOpen.',
    url: 'https://www.dineopen.com/for/tiffin-services',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/tiffin-services' },
};

export default function TiffinServicesPage() {
  return <TiffinServicesClient />;
}
