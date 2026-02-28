import BoostRepeatCustomersClient from './BoostRepeatCustomersClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Boost Repeat Customers for Restaurants | DineOpen',
  description: 'Turn one-time diners into loyal regulars. Customer profiles, loyalty rewards, smart campaigns, and retention analytics for restaurants with DineOpen POS.',
  keywords: 'repeat customers, restaurant loyalty program, customer retention, loyalty rewards, restaurant CRM, DineOpen, customer engagement',
  openGraph: {
    title: 'Boost Repeat Customers for Restaurants | DineOpen',
    description: 'Turn one-time diners into loyal regulars. Customer profiles, loyalty rewards, smart campaigns, and retention analytics for restaurants with DineOpen POS.',
    url: 'https://www.dineopen.com/solutions/boost-repeat-customers',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boost Repeat Customers for Restaurants | DineOpen',
    description: 'Turn one-time diners into loyal regulars. Customer profiles, loyalty rewards, smart campaigns, and retention analytics for restaurants with DineOpen POS.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/boost-repeat-customers',
  },
};

export default function BoostRepeatCustomersPage() {
  return <BoostRepeatCustomersClient />;
}
