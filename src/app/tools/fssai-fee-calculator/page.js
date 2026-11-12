import FSSAIFeeCalculatorClient from './FSSAIFeeCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'FSSAI License Fee Calculator 2026 (New ₹1.5 Cr Limit) | DineOpen',
  description: 'Which FSSAI licence do you need and what does it cost? Uses the new limits from 1 April 2026: registration up to ₹1.5 crore turnover (₹100/year), State up to ₹50 crore, Central above. No renewal needed.',
  keywords: 'FSSAI fee calculator, FSSAI license cost, food license fee India, FSSAI registration fee, state food license cost, central FSSAI fee',
  openGraph: {
    title: 'FSSAI License Fee Calculator | Food License Cost | DineOpen',
    description: 'FSSAI fee and licence type for your turnover, with the new 1 April 2026 limits.',
    url: 'https://www.dineopen.com/tools/fssai-fee-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/fssai-fee-calculator' },
};

export default function FSSAIFeeCalculatorPage() {
  return <FSSAIFeeCalculatorClient />;
}
