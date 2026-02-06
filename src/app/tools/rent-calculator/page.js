import RentCalculatorClient from './RentCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Rent Affordability Calculator | How Much Rent | DineOpen',
  description: 'Calculate how much rent your restaurant can afford. Use the 5-10% revenue rule to determine sustainable rent based on expected sales.',
  keywords: 'restaurant rent calculator, how much rent can restaurant afford, restaurant rent percentage, rent to revenue ratio restaurant',
  openGraph: {
    title: 'Restaurant Rent Affordability Calculator | DineOpen',
    description: 'Calculate sustainable rent for your restaurant based on expected revenue.',
    url: 'https://www.dineopen.com/tools/rent-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/rent-calculator' },
};

export default function RentCalculatorPage() {
  return <RentCalculatorClient />;
}
