import JuiceBarsClient from './JuiceBarsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Juice Bars & Smoothie Shops India | DineOpen',
  description: 'Best POS for juice bars, smoothie shops & fresh juice corners in India. Quick billing, customization handling, inventory for perishables, loyalty programs. ₹999/month.',
  keywords: 'juice bar POS India, smoothie shop software, fresh juice billing, juice corner POS, fruit juice shop software, healthy drinks billing',
  openGraph: {
    title: 'POS Software for Juice Bars & Smoothie Shops India | DineOpen',
    description: 'Best POS for juice bars with quick billing, customization handling, and loyalty programs.',
    url: 'https://www.dineopen.com/for/juice-bars',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/juice-bars' },
};

export default function JuiceBarsPage() {
  return <JuiceBarsClient />;
}
