import ChineseRestaurantsClient from './ChineseRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Chinese & Indo-Chinese Restaurants | DineOpen',
  description: 'Best POS for Chinese and Indo-Chinese restaurants. Manage wok stations, combo meals, customizations (spice level, gravy). Fast billing for high-volume takeaway.',
  keywords: 'Chinese restaurant POS, Indo-Chinese restaurant software, wok station management, noodle shop POS, Chinese takeaway software, manchurian restaurant POS, fast food Chinese POS',
  openGraph: {
    title: 'POS Software for Chinese Restaurants | DineOpen',
    description: 'Specialized POS for Chinese restaurants with wok management, combo meals, and high-volume billing.',
    url: 'https://www.dineopen.com/for/chinese-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/chinese-restaurants',
  },
};

export default function ChineseRestaurantsPage() {
  return <ChineseRestaurantsClient />;
}
