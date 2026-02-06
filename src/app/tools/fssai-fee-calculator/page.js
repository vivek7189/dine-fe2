import FSSAIFeeCalculatorClient from './FSSAIFeeCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'FSSAI License Fee Calculator | Food License Cost India | DineOpen',
  description: 'Calculate FSSAI license fees for your food business. Basic, State, or Central license costs based on turnover. Get accurate fee estimates for registration.',
  keywords: 'FSSAI fee calculator, FSSAI license cost, food license fee India, FSSAI registration fee, state food license cost, central FSSAI fee',
  openGraph: {
    title: 'FSSAI License Fee Calculator | Food License Cost | DineOpen',
    description: 'Calculate exact FSSAI license fees based on your business turnover and license type.',
    url: 'https://www.dineopen.com/tools/fssai-fee-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/fssai-fee-calculator' },
};

export default function FSSAIFeeCalculatorPage() {
  return <FSSAIFeeCalculatorClient />;
}
