import FloorPlanClient from './FloorPlanClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Floor Plan Software | Visual Table Layout | DineOpen',
  description: 'Design restaurant floor plans with multi-floor support, table placement, capacity configuration, and real-time occupancy tracking. Bulk table creation and floor-wise grouping.',
  keywords: 'restaurant floor plan software, table layout design, restaurant seating plan, floor management restaurant, table map software',
  openGraph: {
    title: 'Restaurant Floor Plan Software | DineOpen',
    description: 'Visual floor plans with multi-floor support and real-time table occupancy tracking.',
    url: 'https://www.dineopen.com/products/tables/floor-plan',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/tables/floor-plan' },
};

export default function FloorPlanPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Floor Plan",
    "applicationCategory": "BusinessApplication",
    "description": "Restaurant floor plan design with multi-floor management, table placement, capacity configuration, and real-time occupancy visualization.",
    "url": "https://www.dineopen.com/products/tables/floor-plan",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR" }
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How do I set up a floor plan?", "acceptedAnswer": { "@type": "Answer", "text": "Add floors from the Tables section, then create tables on each floor with number, capacity, and type. Tables are displayed in a visual grid with color-coded status indicators." } },
      { "@type": "Question", "name": "Can I add multiple floors?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Add unlimited floors like Ground Floor, First Floor, Rooftop, Outdoor, or Banquet Hall. Each floor has independent table management and availability tracking." } },
      { "@type": "Question", "name": "How does bulk table creation work?", "acceptedAnswer": { "@type": "Answer", "text": "Specify a number range (e.g., 1-20), select the floor, set capacity (2/4/6 seater), and DineOpen creates all 20 tables at once. Much faster than adding one at a time." } },
      { "@type": "Question", "name": "Can I see occupancy per floor?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Each floor shows total tables, available, occupied, and reserved counts. The dashboard provides floor-wise statistics to help you direct guests and manage capacity." } },
      { "@type": "Question", "name": "Can I merge tables for large groups?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Select adjacent tables and merge them temporarily for large parties. The merged tables show as a single unit with combined capacity. Unmerge them when the group leaves." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Tables", "item": "https://www.dineopen.com/products/tables" },
      { "@type": "ListItem", "position": 3, "name": "Floor Plan", "item": "https://www.dineopen.com/products/tables/floor-plan" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <FloorPlanClient />
    </>
  );
}
