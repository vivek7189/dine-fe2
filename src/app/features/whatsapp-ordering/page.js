import WhatsAppOrderingClient from './WhatsAppOrderingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'WhatsApp Ordering for Restaurants | Take Orders on WhatsApp — DineOpen',
  description: 'Let customers order food directly on WhatsApp — no app to download. A guided chat handles your menu, sizes, toppings, delivery address and payment, and every order drops into your POS and kitchen. Commission-free, works worldwide (US, UK, Europe, Middle East, India).',
  keywords: 'WhatsApp ordering, order food on WhatsApp, restaurant WhatsApp orders, WhatsApp food ordering system, WhatsApp ordering for restaurants, WhatsApp business ordering, take orders on WhatsApp, WhatsApp menu ordering, commission-free online ordering',
  openGraph: {
    title: 'WhatsApp Ordering for Restaurants | DineOpen',
    description: 'Let customers order from your restaurant on WhatsApp — guided menu, delivery, payments — straight into your POS and kitchen. No app, no commissions.',
    url: 'https://www.dineopen.com/features/whatsapp-ordering',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Ordering for Restaurants | DineOpen',
    description: 'Let customers order from your restaurant on WhatsApp — straight into your POS and kitchen. No app, no commissions.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/whatsapp-ordering',
  },
};

export default function WhatsAppOrderingPage() {
  return <WhatsAppOrderingClient />;
}
