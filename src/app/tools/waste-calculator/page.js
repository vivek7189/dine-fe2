import WasteCalculatorClient from './WasteCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Food Waste Calculator | Track Restaurant Wastage | DineOpen',
  description: 'Free food waste calculator for restaurants. Track daily wastage, calculate losses, and identify areas to reduce waste. Save money and help the environment.',
  keywords: 'food waste calculator, restaurant waste tracking, food wastage calculator, kitchen waste management, reduce food waste restaurant',
  openGraph: {
    title: 'Food Waste Calculator | DineOpen',
    description: 'Track and reduce food waste in your restaurant. Free calculator.',
    url: 'https://www.dineopen.com/tools/waste-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/waste-calculator' },
};

export default function WasteCalculatorPage() {
  return <WasteCalculatorClient />;
}
