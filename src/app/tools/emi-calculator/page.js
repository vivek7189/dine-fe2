import EMICalculatorClient from './EMICalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Loan EMI Calculator | Business Loan | DineOpen',
  description: 'Calculate EMI for restaurant business loans. Plan your loan amount, tenure, and monthly payments for restaurant startup or expansion.',
  keywords: 'restaurant loan emi calculator, business loan calculator, restaurant financing, startup loan emi, msme loan calculator',
  openGraph: {
    title: 'Restaurant Loan EMI Calculator | DineOpen',
    description: 'Calculate monthly EMI for restaurant business loans and financing.',
    url: 'https://www.dineopen.com/tools/emi-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/emi-calculator' },
};

export default function EMICalculatorPage() {
  return <EMICalculatorClient />;
}
