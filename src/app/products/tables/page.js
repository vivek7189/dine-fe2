import TablesLandingClient from './TablesLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Table Management & Reservation System | DineOpen Tables',
  description: 'Restaurant table management and reservation system with floor planning, real-time status tracking, date/time booking, and capacity configuration. Manage multiple floors and optimize table turnover.',
  keywords: 'restaurant table management, table reservation system, restaurant booking software, floor plan management, table tracking software, restaurant reservation app',
  openGraph: {
    title: 'Table Management & Reservation System | DineOpen Tables',
    description: 'Manage restaurant tables, floors, and reservations. Real-time availability tracking and visual floor plans.',
    url: 'https://www.dineopen.com/products/tables',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Table Management & Reservation System | DineOpen',
    description: 'Floor planning, real-time table status, and smart reservation management for restaurants.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/tables',
  },
};

export default function TablesPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Tables",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Table Management Software",
    "description": "Complete table management and reservation system with floor planning, real-time status tracking, booking management, and capacity optimization for restaurants.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/tables",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark plan" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Spark plan (India)" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "Blaze plan" },
      { "@type": "Offer", "price": "2500", "priceCurrency": "INR", "description": "Blaze plan (India)" }
    ],
    "featureList": [
      "Floor management with multiple floors",
      "Table CRUD with capacity configuration",
      "Bulk table creation",
      "Real-time table status tracking",
      "Date and time-based booking",
      "Floor-wise table grouping",
      "Availability statistics",
      "Visual status indicators"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "380"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can I manage multiple floors?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen Tables supports unlimited floors. Add, edit, or delete floors and assign tables to each. View floor-wise availability at a glance and switch between floors in the dashboard." } },
      { "@type": "Question", "name": "How does the reservation system work?", "acceptedAnswer": { "@type": "Answer", "text": "Customers or staff can book tables by selecting date, time, party size, and preferred seating. The system shows only available tables for the requested slot. Confirmation is sent via WhatsApp or SMS." } },
      { "@type": "Question", "name": "Can I create tables in bulk?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use bulk table creation to add multiple tables at once by specifying a number range (e.g., Table 1-20), capacity, and floor assignment. Saves significant setup time for new restaurants." } },
      { "@type": "Question", "name": "What table statuses are tracked?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen tracks four statuses: Available (green), Occupied (red), Reserved (yellow), and Blocked (gray). Status updates in real-time as orders are placed, completed, or reservations are checked in." } },
      { "@type": "Question", "name": "Does DineOpen Tables integrate with billing?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. When a table is occupied, orders are linked to that table. Bills are generated per table, and the table automatically returns to Available status when the bill is settled." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Tables", "item": "https://www.dineopen.com/products/tables" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <TablesLandingClient />
    </>
  );
}
