import FineDiningClient from './FineDiningClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Fine Dining Restaurants | Premium Service | DineOpen',
  description: 'Elegant POS solution for fine dining restaurants. Course-based ordering, wine pairing, guest preferences, split billing, tableside service. Enhance your premium dining experience.',
  keywords: 'fine dining POS, luxury restaurant software, premium restaurant POS, course management system, wine pairing POS, upscale restaurant software, tableside ordering fine dining',
  openGraph: {
    title: 'POS Software for Fine Dining Restaurants | DineOpen',
    description: 'Premium POS for fine dining with course management, wine pairing, and elegant tableside service.',
    url: 'https://www.dineopen.com/for/fine-dining',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/fine-dining',
  },
};

export default function FineDiningPage() {
  return <FineDiningClient />;
}
