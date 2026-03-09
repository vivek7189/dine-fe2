import RevenueForecastClient from './RevenueForecastClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Revenue Forecast Calculator [Free, No Login] | DineOpen',
  description: 'Free restaurant revenue forecast calculator. Estimate daily, monthly & annual revenue based on seats, turnover, average check & occupancy. No login required.',
  keywords: 'restaurant revenue calculator, restaurant revenue forecast, restaurant sales calculator, restaurant income calculator, restaurant revenue estimator free',
  openGraph: {
    title: 'Restaurant Revenue Forecast Calculator [Free] | DineOpen',
    description: 'Estimate your restaurant revenue based on seats, turnover & average check. Free, no login.',
    url: 'https://www.dineopen.com/tools/revenue-forecast-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/revenue-forecast-calculator',
  },
};

export default function RevenueForecastCalculatorPage() {
  return <RevenueForecastClient />;
}
