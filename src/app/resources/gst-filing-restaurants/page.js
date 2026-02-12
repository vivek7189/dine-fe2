import GstFilingClient from './GstFilingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'GST Filing for Restaurants | Monthly Compliance Guide | DineOpen',
  description: 'Complete guide to GST filing for restaurants in India. Learn about GSTR-1, GSTR-3B, GST rates, input tax credit, and monthly compliance requirements.',
  keywords: 'GST filing restaurants, restaurant GST compliance, GSTR-1 restaurant, GSTR-3B food business, GST rates food, restaurant tax filing',
  openGraph: {
    title: 'GST Filing for Restaurants | Monthly Guide',
    description: 'Everything about monthly GST compliance for your restaurant business.',
    url: 'https://www.dineopen.com/resources/gst-filing-restaurants',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/gst-filing-restaurants',
  },
};

export default function GstFilingPage() {
  return <GstFilingClient />;
}
