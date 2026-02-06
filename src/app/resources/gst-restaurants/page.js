import GSTRestaurantsClient from './GSTRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'GST for Restaurants India 2024 | Complete Tax Guide | DineOpen',
  description: 'Complete GST guide for restaurants in India. Tax rates (5% vs 18%), input tax credit, composition scheme, filing process, invoicing requirements. Updated for 2024.',
  keywords: 'GST restaurant India, restaurant GST rate, 5% GST restaurant, restaurant tax India, GST billing restaurant, food service tax, restaurant invoicing GST',
  openGraph: {
    title: 'GST for Restaurants India | Complete Tax Guide | DineOpen',
    description: 'Complete GST guide for restaurants. Tax rates, ITC, composition scheme, and filing process.',
    url: 'https://www.dineopen.com/resources/gst-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/gst-restaurants' },
};

export default function GSTRestaurantsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete GST Guide for Restaurants in India 2024",
    "description": "Everything restaurant owners need to know about GST - rates, ITC, composition scheme, and compliance.",
    "author": { "@type": "Organization", "name": "DineOpen" },
    "publisher": { "@type": "Organization", "name": "DineOpen" },
    "datePublished": "2024-01-01",
    "dateModified": "2024-12-01"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <GSTRestaurantsClient />
    </>
  );
}
