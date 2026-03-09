import StartupCostClient from './StartupCostClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Startup Cost Calculator [Free] — Estimate Opening Costs | DineOpen',
  description: 'Free restaurant startup cost calculator. Estimate total investment needed to open a restaurant in India — rent, equipment, licenses, inventory, and more. No login required.',
  keywords: 'restaurant startup cost calculator, how much to open restaurant in india, restaurant opening cost calculator, restaurant investment calculator, cost to start restaurant',
  openGraph: {
    title: 'Restaurant Startup Cost Calculator [Free] | DineOpen',
    description: 'Estimate total investment needed to open a restaurant. Covers rent, equipment, licenses & more.',
    url: 'https://www.dineopen.com/tools/startup-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/startup-cost-calculator' },
};

export default function StartupCostCalculatorPage() {
  return <StartupCostClient />;
}
