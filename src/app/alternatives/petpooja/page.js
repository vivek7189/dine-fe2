import PetpoojaAlternativeClient from './PetpoojaAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Petpooja Alternative 2026 | DineOpen - AI POS, Lower Fees India',
  description: 'Looking for a Petpooja alternative? DineOpen offers AI voice ordering, zero transaction fees vs Petpooja\'s 1.5-2%. GST billing, Zomato/Swiggy integration. Save ₹50,000+/year. Free 30-day trial.',
  keywords: 'Petpooja alternative, Petpooja alternative India, better than Petpooja, Petpooja competitor, restaurant POS India, GST billing software, Petpooja vs DineOpen, affordable restaurant POS India, AI POS India, restaurant billing software India, Zomato integration POS',
  openGraph: {
    title: 'Best Petpooja Alternative | DineOpen - AI-Powered, Lower Fees',
    description: 'Switch from Petpooja to DineOpen. Get AI voice ordering, zero transaction fees, GST billing. Free 30-day trial.',
    url: 'https://www.dineopen.com/alternatives/petpooja',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-petpooja-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best Petpooja Alternative in India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Petpooja Alternative | DineOpen - AI POS, Lower Fees',
    description: 'Switch from Petpooja to DineOpen. AI voice ordering, zero transaction fees, GST billing. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/petpooja',
  },
};

export default function PetpoojaAlternativePage() {
  return <PetpoojaAlternativeClient />;
}
