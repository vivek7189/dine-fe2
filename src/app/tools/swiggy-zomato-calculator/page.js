import SwiggyZomatoClient from './SwiggyZomatoClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Swiggy & Zomato Commission Calculator | Aggregator Profit | DineOpen',
  description: 'Calculate your actual profit after Swiggy and Zomato commissions. Understand aggregator fees, GST impact, and net margins on delivery orders.',
  keywords: 'swiggy commission calculator, zomato commission rate, aggregator profit calculator, food delivery commission, swiggy zomato fees',
  openGraph: {
    title: 'Swiggy & Zomato Commission Calculator | DineOpen',
    description: 'Calculate actual profit after food aggregator commissions and fees.',
    url: 'https://www.dineopen.com/tools/swiggy-zomato-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/swiggy-zomato-calculator' },
};

export default function SwiggyZomatoCalculatorPage() {
  return <SwiggyZomatoClient />;
}
