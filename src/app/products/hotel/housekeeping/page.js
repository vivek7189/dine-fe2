import HousekeepingClient from './HousekeepingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Hotel Housekeeping Management Software | Room Cleaning & Maintenance | DineOpen',
  description: 'Hotel housekeeping management software for maintenance scheduling, room status tracking, and cleaning management. Track clean, dirty, and maintenance rooms. Cloud-based for small hotels.',
  keywords: 'hotel housekeeping software, room cleaning management, hotel maintenance scheduling, housekeeping tracking, room status management, hotel cleaning software, small hotel housekeeping',
  openGraph: {
    title: 'Hotel Housekeeping Management Software | DineOpen',
    description: 'Maintenance scheduling, room status tracking, and cleaning management for small hotels.',
    url: 'https://www.dineopen.com/products/hotel/housekeeping',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/hotel/housekeeping',
  },
};

export default function HousekeepingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Hotel Housekeeping Management",
    "description": "Housekeeping management software for hotels with maintenance scheduling, room status tracking, and cleaning management.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/hotel/housekeeping",
    "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How does housekeeping management work in DineOpen Hotel?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen Hotel tracks room status with indicators for clean, dirty, and maintenance. You can schedule maintenance periods, update room cleaning status, and filter rooms by their housekeeping state to prioritize tasks." } },
      { "@type": "Question", "name": "Can I schedule maintenance for rooms?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can schedule maintenance for any room by setting start and end dates with a reason. During the maintenance period, the room is automatically blocked from bookings and marked as unavailable." } },
      { "@type": "Question", "name": "What room status indicators are available?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen Hotel uses visual status indicators: green for clean/available, red for occupied, yellow for needs cleaning, and grey for under maintenance. Staff can filter rooms by any status for a focused view." } },
      { "@type": "Question", "name": "How do I track room turnover between guests?", "acceptedAnswer": { "@type": "Answer", "text": "When a guest checks out, the room status changes to needs cleaning. Housekeeping staff can see all rooms pending cleaning, mark them as cleaned once done, and the room returns to available status." } },
      { "@type": "Question", "name": "Does housekeeping integrate with the booking system?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Room availability is affected by housekeeping status. A room under maintenance or pending cleaning will not show as available for new bookings, preventing guests from being assigned dirty or broken rooms." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Hotel Management", "item": "https://www.dineopen.com/products/hotel" },
      { "@type": "ListItem", "position": 4, "name": "Housekeeping", "item": "https://www.dineopen.com/products/hotel/housekeeping" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <HousekeepingClient />
    </>
  );
}
