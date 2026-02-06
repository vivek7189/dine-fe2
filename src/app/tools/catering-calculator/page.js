import CateringCalculatorClient from './CateringCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Catering Quote Calculator | Price Per Person | DineOpen',
  description: 'Free catering price calculator. Generate quotes based on menu type, guest count, and service style. Calculate catering cost per person.',
  keywords: 'catering quote calculator, catering price per person, catering cost calculator, event catering pricing, wedding catering quote',
  openGraph: {
    title: 'Catering Quote Calculator | Price Per Person | DineOpen',
    description: 'Calculate catering costs and generate professional quotes for events.',
    url: 'https://www.dineopen.com/tools/catering-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/catering-calculator' },
};

export default function CateringCalculatorPage() {
  return <CateringCalculatorClient />;
}
