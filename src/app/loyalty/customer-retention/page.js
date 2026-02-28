import CustomerRetentionClient from './CustomerRetentionClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Customer Retention Tools for Restaurants | DineOpen',
  description: 'Stop losing restaurant customers with automated win-back campaigns. Track visit patterns, send targeted offers, and measure retention rates in real time.',
  keywords: 'customer retention, restaurant retention tools, win-back campaigns, reduce churn, repeat customers, restaurant marketing',
  openGraph: {
    title: 'Customer Retention Tools for Restaurants | DineOpen',
    description: 'Stop losing restaurant customers with automated win-back campaigns. Track visit patterns, send targeted offers, and measure retention rates in real time.',
    url: 'https://www.dineopen.com/loyalty/customer-retention',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Retention Tools for Restaurants | DineOpen',
    description: 'Stop losing restaurant customers with automated win-back campaigns. Track visit patterns, send targeted offers, and measure retention rates in real time.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/loyalty/customer-retention',
  },
};

export default function CustomerRetentionPage() {
  return <CustomerRetentionClient />;
}
