import CompareClient from './CompareClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Compare Restaurant POS Systems 2026 | DineOpen vs Square vs Toast vs Petpooja',
  description: 'Compare the best restaurant POS systems: DineOpen vs Square vs Toast vs Petpooja. See pricing, features, transaction fees & AI capabilities. Find the best POS for your restaurant.',
  keywords: 'restaurant POS comparison, Square vs Toast, DineOpen vs Petpooja, best restaurant POS 2026, POS system comparison, restaurant billing software comparison, Square alternative, Toast alternative, Petpooja alternative, affordable restaurant POS, AI POS comparison',
  openGraph: {
    title: 'Compare Restaurant POS Systems | DineOpen vs Square vs Toast vs Petpooja',
    description: 'Side-by-side comparison of top restaurant POS systems. Compare pricing, features, transaction fees & find the best fit for your restaurant.',
    url: 'https://www.dineopen.com/compare',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-compare.jpg',
        width: 1200,
        height: 630,
        alt: 'Restaurant POS Comparison - DineOpen vs Square vs Toast vs Petpooja',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Restaurant POS Systems | DineOpen vs Square vs Toast vs Petpooja',
    description: 'Side-by-side comparison of top restaurant POS systems. Compare pricing, features & transaction fees.',
    images: ['https://www.dineopen.com/og-compare.jpg'],
  },
  alternates: {
    canonical: 'https://www.dineopen.com/compare',
  },
};

export default function ComparePage() {
  return <CompareClient />;
}
