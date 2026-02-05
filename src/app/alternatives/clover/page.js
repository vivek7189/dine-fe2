import CloverAlternativeClient from './CloverAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Clover POS Alternative 2026 | DineOpen - AI-Powered, No Hardware Lock-in',
  description: 'Looking for a Clover alternative? DineOpen offers AI voice ordering, works on any device (no Clover hardware needed), zero transaction fees. Free 30-day trial.',
  keywords: 'Clover alternative, Clover POS alternative, better than Clover, Clover competitor, Clover replacement, restaurant POS no hardware, AI restaurant POS, Clover for restaurants alternative',
  openGraph: {
    title: 'Best Clover POS Alternative | DineOpen - AI-Powered, No Hardware',
    description: 'Switch from Clover to DineOpen. Works on any device, AI voice ordering, zero fees.',
    url: 'https://www.dineopen.com/alternatives/clover',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/clover',
  },
};

export default function CloverAlternativePage() {
  return <CloverAlternativeClient />;
}
