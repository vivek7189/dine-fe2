import HotelsClient from './HotelsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'F&B POS Software for Hotels India | DineOpen',
  description: 'Best restaurant and F&B POS software for hotels in India. Room service, multi-outlet management, room billing integration, banquet management.',
  keywords: 'hotel restaurant POS India, F&B management hotel, room service software, hotel dining POS, banquet billing software India',
  openGraph: {
    title: 'F&B POS Software for Hotels India | DineOpen',
    description: 'Best F&B POS software for hotels in India with room service and multi-outlet management.',
    url: 'https://www.dineopen.com/for/hotels',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/hotels',
  },
};

export default function HotelsPage() {
  return <HotelsClient />;
}
