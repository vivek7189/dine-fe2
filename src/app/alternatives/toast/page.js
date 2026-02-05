import ToastAlternativeClient from './ToastAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Toast POS Alternative 2026 | DineOpen - AI-Powered, Lower Cost',
  description: 'Looking for a Toast alternative? DineOpen offers AI voice ordering, zero transaction fees vs Toast\'s 2.49%. No hardware lock-in. Save $7,000+/year. Free 30-day trial.',
  keywords: 'Toast alternative, Toast POS alternative, better than Toast, Toast competitor, Toast replacement, Toast POS cheaper alternative, restaurant POS without fees, AI restaurant POS, Toast for restaurants alternative, affordable Toast alternative',
  openGraph: {
    title: 'Best Toast POS Alternative | DineOpen - AI-Powered, Zero Fees',
    description: 'Switch from Toast to DineOpen. Get AI voice ordering, zero transaction fees, no hardware lock-in. Free 30-day trial.',
    url: 'https://www.dineopen.com/alternatives/toast',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-toast-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best Toast POS Alternative',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Toast POS Alternative | DineOpen - Save on Fees',
    description: 'Switch from Toast to DineOpen. AI voice ordering, zero transaction fees. Free 30-day trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/toast',
  },
};

export default function ToastAlternativePage() {
  return <ToastAlternativeClient />;
}
