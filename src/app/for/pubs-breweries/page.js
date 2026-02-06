import PubsBreweriesClient from './PubsBreweriesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Pubs & Microbreweries India | Bar Management | DineOpen',
  description: 'Best POS for pubs, microbreweries, bars & taprooms in India. Tab management, happy hour pricing, age verification, keg tracking, liquor inventory. ₹999/month.',
  keywords: 'pub POS India, microbrewery software, bar billing system, taproom POS, liquor inventory management, happy hour pricing software',
  openGraph: {
    title: 'POS Software for Pubs & Microbreweries India | DineOpen',
    description: 'Best POS for pubs and breweries with tab management, happy hour pricing, and keg tracking.',
    url: 'https://www.dineopen.com/for/pubs-breweries',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/pubs-breweries' },
};

export default function PubsBreweriesPage() {
  return <PubsBreweriesClient />;
}
