import RestaurantPOSClient from './RestaurantPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS & Billing Software India | DineOpen',
  description: 'Restaurant POS, billing and management software for India: GST bills, KOT, tables, UPI, inventory, staff and reports on your phone or tablet. 7-day free trial.',
  keywords: 'restaurant POS software India, restaurant billing software, QR menu India, digital menu software, restaurant management system India, GST billing software restaurant, UPI payment restaurant, cloud kitchen POS, cafe billing software India',
  authors: [{ name: 'DineOpen Team' }],
  creator: 'DineOpen',
  publisher: 'DineOpen',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Restaurant POS & Billing Software India | DineOpen',
    description: 'Best restaurant POS software in India with QR ordering, digital menu, GST billing, UPI payments, inventory & WhatsApp automation. Built for Indian restaurants.',
    url: 'https://www.dineopen.com/restaurant-pos-software-india',
    siteName: 'DineOpen',
    images: [
      {
        url: '/og-restaurant-pos.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen Restaurant POS Software India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS & Billing Software India | DineOpen',
    description: 'Best restaurant POS software in India with QR ordering, digital menu, GST billing, UPI payments & WhatsApp automation.',
    images: ['/og-restaurant-pos.jpg'],
  },
  alternates: {
    canonical: 'https://www.dineopen.com/restaurant-pos-software-india',
  },
};

export default function RestaurantPOSSoftwareIndia() {
  return <RestaurantPOSClient />;
}
