import CLVCalculatorClient from './CLVCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Customer Lifetime Value Calculator for Restaurants [Free] | DineOpen',
  description: 'Calculate customer lifetime value (CLV) for your restaurant. Know how much each customer is worth and make smarter marketing decisions. Free, no login.',
  keywords: 'customer lifetime value calculator, restaurant CLV calculator, customer value calculator, restaurant customer retention calculator, CLV formula restaurant',
  openGraph: {
    title: 'Customer Lifetime Value Calculator for Restaurants [Free] | DineOpen',
    description: 'Calculate how much each customer is worth to your restaurant over their lifetime.',
    url: 'https://www.dineopen.com/tools/customer-lifetime-value-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/customer-lifetime-value-calculator',
  },
};

export default function CLVCalculatorPage() {
  return <CLVCalculatorClient />;
}
