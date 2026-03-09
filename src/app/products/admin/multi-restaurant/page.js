import MultiRestaurantClient from './MultiRestaurantClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Multi-Restaurant Management Software | Chain Operations | DineOpen',
  description: 'Manage multiple restaurant locations from one dashboard. Menu synchronization, cross-location reporting, staff transfers, centralized inventory, and currency support for 150+ countries.',
  keywords: 'multi restaurant management, restaurant chain software, multi location restaurant, centralized restaurant management, franchise management software',
  openGraph: { title: 'Multi-Restaurant Management | DineOpen', description: 'Manage multiple locations, sync menus, and view consolidated reports.', url: 'https://www.dineopen.com/products/admin/multi-restaurant' },
  alternates: { canonical: 'https://www.dineopen.com/products/admin/multi-restaurant' },
};

export default function MultiRestaurantPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Multi-Restaurant", "applicationCategory": "BusinessApplication", "description": "Multi-location restaurant management with menu sync, consolidated reporting, and centralized operations.", "url": "https://www.dineopen.com/products/admin/multi-restaurant", "offers": [{ "@type": "Offer", "price": "89", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "How many locations can I manage?", "acceptedAnswer": { "@type": "Answer", "text": "Unlimited. DineOpen supports any number of restaurant locations under one account. Add new locations anytime - each gets independent menus, staff, inventory, and billing." } },
      { "@type": "Question", "name": "Can I see reports across all locations?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. View consolidated sales, revenue, and performance reports across all locations. Drill down to individual restaurants. Compare performance between locations side by side." } },
      { "@type": "Question", "name": "How does menu synchronization work?", "acceptedAnswer": { "@type": "Answer", "text": "Create a master menu and push it to selected locations. Each location can modify prices, toggle availability, or add location-specific items. Core items stay in sync while allowing local flexibility." } },
      { "@type": "Question", "name": "Can staff work at multiple locations?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Assign staff to multiple locations. They switch between locations in the app. Performance and activity are tracked per location." } },
      { "@type": "Question", "name": "Does it support international locations?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen supports 150+ currencies with proper formatting. Each location uses its local currency, tax rates, and regulatory requirements. Reports can show converted values." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Admin", "item": "https://www.dineopen.com/products/admin" },
      { "@type": "ListItem", "position": 3, "name": "Multi-Restaurant", "item": "https://www.dineopen.com/products/admin/multi-restaurant" }
    ]}
  ];
  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <MultiRestaurantClient />
    </>
  );
}
