import FireSafetyClient from './FireSafetyClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Fire Safety NOC for Restaurants | Requirements | DineOpen',
  description: 'Complete guide to Fire Safety NOC for restaurants in India. Requirements, equipment needed, and inspection process.',
  keywords: 'fire safety NOC restaurant, fire NOC, restaurant fire license, fire extinguisher restaurant, fire safety compliance',
  openGraph: {
    title: 'Fire Safety NOC for Restaurants',
    description: 'Everything about Fire Safety NOC for your restaurant.',
    url: 'https://www.dineopen.com/resources/fire-safety-noc',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/fire-safety-noc',
  },
};

export default function FireSafetyPage() {
  return <FireSafetyClient />;
}
