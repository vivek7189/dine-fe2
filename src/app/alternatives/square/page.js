import SquareAlternativeClient from './SquareAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Square POS Alternative 2026 | DineOpen - Save 80% on Fees',
  description: 'Looking for a Square alternative? DineOpen offers AI voice ordering, QR menus, zero transaction fees vs Square\'s 2.6%. Save $5,000+/year. Free 30-day trial. Perfect for restaurants, cafes & bars.',
  keywords: 'Square alternative, Square POS alternative, better than Square, Square competitor, Square replacement, affordable POS system, restaurant POS without fees, AI restaurant POS, Square for restaurants alternative, cheap Square alternative',
  openGraph: {
    title: 'Best Square POS Alternative | DineOpen - AI-Powered, Zero Fees',
    description: 'Switch from Square to DineOpen. Get AI voice ordering, zero transaction fees, and save thousands yearly. Free 30-day trial.',
    url: 'https://www.dineopen.com/alternatives/square',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-square-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best Square POS Alternative',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Square POS Alternative | DineOpen - Save 80% on Fees',
    description: 'Switch from Square to DineOpen. AI voice ordering, zero transaction fees. Free 30-day trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/square',
  },
};

export default function SquareAlternativePage() {
  return <SquareAlternativeClient />;
}
