import WhatsAppOrderingClient from './WhatsAppOrderingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'WhatsApp Ordering for Restaurants | DineOpen',
  description: 'Let customers order food via WhatsApp. Share menus, accept orders, send confirmations, and collect payments through India\'s most popular messaging app.',
  keywords: 'WhatsApp ordering, restaurant WhatsApp orders, WhatsApp food ordering, WhatsApp menu sharing, WhatsApp business restaurant',
  openGraph: {
    title: 'WhatsApp Ordering for Restaurants | DineOpen',
    description: 'Let customers order food via WhatsApp. Share menus, accept orders, and collect payments easily.',
    url: 'https://www.dineopen.com/features/whatsapp-ordering',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Ordering for Restaurants | DineOpen',
    description: 'Let customers order food via WhatsApp. Share menus, accept orders, and collect payments easily.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/whatsapp-ordering',
  },
};

export default function WhatsAppOrderingPage() {
  return <WhatsAppOrderingClient />;
}
