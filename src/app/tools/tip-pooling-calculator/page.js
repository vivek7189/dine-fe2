import TipPoolingClient from './TipPoolingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Tip Pooling Calculator | Fair Tip Distribution | DineOpen',
  description: 'Free tip pooling calculator for restaurants. Distribute tips fairly among staff based on hours worked, role, and shift. Support for multiple tip sharing methods.',
  keywords: 'tip pooling calculator, tip distribution, how to split tips, tip sharing restaurant, fair tip distribution, tip out calculator',
  openGraph: {
    title: 'Tip Pooling Calculator | Fair Tip Distribution | DineOpen',
    description: 'Calculate fair tip distribution among restaurant staff based on hours and roles.',
    url: 'https://www.dineopen.com/tools/tip-pooling-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/tip-pooling-calculator' },
};

export default function TipPoolingCalculatorPage() {
  return <TipPoolingClient />;
}
