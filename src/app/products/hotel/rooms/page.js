import RoomsClient from './RoomsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Hotel Room Management Software | Room Inventory & Status Tracking | DineOpen',
  description: 'Manage hotel room inventory, track room status, add rooms in bulk, and schedule maintenance. Cloud-based room management for small hotels. From $20/month.',
  keywords: 'hotel room management software, room inventory system, room status tracking, bulk room add, hotel maintenance scheduling, room availability software, small hotel room management',
  openGraph: {
    title: 'Hotel Room Management Software | DineOpen',
    description: 'Room inventory, status tracking, bulk add, and maintenance scheduling for small hotels.',
    url: 'https://www.dineopen.com/products/hotel/rooms',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/hotel/rooms',
  },
};

export default function RoomsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Hotel Room Management",
    "description": "Room inventory and status tracking software for small hotels. Add rooms individually or in bulk, track availability by date, and schedule maintenance.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/hotel/rooms",
    "offers": { "@type": "Offer", "price": "20", "priceCurrency": "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How do I add rooms to DineOpen Hotel?", "acceptedAnswer": { "@type": "Answer", "text": "You can add rooms one at a time with details like room number, type, floor, and pricing. For faster setup, use the bulk add feature to create multiple rooms at once with shared attributes." } },
      { "@type": "Question", "name": "What room statuses are available?", "acceptedAnswer": { "@type": "Answer", "text": "Rooms can be marked as available, occupied, reserved, under maintenance, or being cleaned. You can filter rooms by any status to get a quick overview of your property." } },
      { "@type": "Question", "name": "Can I check room availability for specific dates?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The room management module lets you check availability by date, showing which rooms are free, booked, or under maintenance for any given period." } },
      { "@type": "Question", "name": "How does maintenance scheduling work?", "acceptedAnswer": { "@type": "Answer", "text": "You can schedule maintenance for any room by setting a date range and reason. The room is automatically marked as unavailable during the maintenance period and shows up in the maintenance filter." } },
      { "@type": "Question", "name": "Can I delete rooms from the system?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Rooms can be deleted with a reason for tracking purposes. The deletion is recorded in the operation history so you have a complete audit trail." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Hotel Management", "item": "https://www.dineopen.com/products/hotel" },
      { "@type": "ListItem", "position": 4, "name": "Room Management", "item": "https://www.dineopen.com/products/hotel/rooms" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <RoomsClient />
    </>
  );
}
