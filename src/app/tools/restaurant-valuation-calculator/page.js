import ValuationClient from './ValuationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Valuation Calculator [Free] — Know Your Business Worth | DineOpen',
  description: 'Free restaurant valuation calculator. Estimate your restaurant business value using revenue multiple and SDE methods. No login required.',
  keywords: 'restaurant valuation calculator, restaurant business valuation, how much is my restaurant worth, restaurant value estimator, restaurant sale price calculator',
  openGraph: {
    title: 'Restaurant Valuation Calculator [Free] | DineOpen',
    description: 'Estimate your restaurant business value using industry-standard methods.',
    url: 'https://www.dineopen.com/tools/restaurant-valuation-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/restaurant-valuation-calculator' },
};

export default function ValuationPage() {
  return <ValuationClient />;
}
