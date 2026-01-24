import BarsPubsClient from './BarsPubsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Bars & Pubs India | DineOpen',
  description: 'Best POS software for bars, pubs, and lounges in India. Tab management, happy hour pricing, inventory tracking, age verification support.',
  keywords: 'bar POS India, pub billing software, lounge management system, nightclub POS, bar inventory software India',
  openGraph: {
    title: 'POS Software for Bars & Pubs India | DineOpen',
    description: 'Best POS software for bars and pubs in India with tab management and happy hour pricing.',
    url: 'https://www.dineopen.com/for/bars-pubs',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/bars-pubs',
  },
};

export default function BarsPubsPage() {
  return <BarsPubsClient />;
}
