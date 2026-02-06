import RestaurantLicensesClient from './RestaurantLicensesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Licenses & Permits India 2024 | Complete Checklist | DineOpen',
  description: 'Complete list of licenses required to open a restaurant in India. FSSAI, GST, fire safety, liquor license, shop act, health license. Costs, timeline, and process.',
  keywords: 'restaurant license India, permits to open restaurant, FSSAI license, liquor license India, fire NOC restaurant, shop establishment license, restaurant permits checklist',
  openGraph: {
    title: 'Restaurant Licenses & Permits India | Complete Checklist | DineOpen',
    description: 'All licenses needed to open a restaurant in India. Costs, timeline, and application process.',
    url: 'https://www.dineopen.com/resources/restaurant-licenses-india',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/restaurant-licenses-india' },
};

export default function RestaurantLicensesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete List of Licenses Required to Open a Restaurant in India",
    "description": "Comprehensive guide to all permits and licenses needed to legally operate a restaurant in India.",
    "author": { "@type": "Organization", "name": "DineOpen" },
    "publisher": { "@type": "Organization", "name": "DineOpen" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <RestaurantLicensesClient />
    </>
  );
}
