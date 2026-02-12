import FeaturesClient from './FeaturesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Features | All-in-One Solution | DineOpen',
  description: 'Explore all DineOpen features: online ordering, table reservation, kitchen display system, staff management, delivery management, WhatsApp ordering, and more.',
  keywords: 'restaurant POS features, online ordering, table reservation, kitchen display system, staff management, delivery management, WhatsApp ordering',
  openGraph: {
    title: 'Restaurant POS Features | DineOpen',
    description: 'All-in-one restaurant management features. Online ordering, KDS, reservations, staff management, and more.',
    url: 'https://www.dineopen.com/features',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features',
  },
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
