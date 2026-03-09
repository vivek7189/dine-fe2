import BookingsClient from './BookingsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Hotel Booking Management System | Reservation Calendar | DineOpen',
  description: 'Hotel booking management with calendar view, reservation tracking, and availability checking. Confirm or cancel bookings, navigate by month/year. Cloud-based for small hotels.',
  keywords: 'hotel booking system, hotel reservation software, booking calendar hotel, room reservation management, hotel availability checking, small hotel booking software',
  openGraph: {
    title: 'Hotel Booking Management System | DineOpen',
    description: 'Calendar-based booking management for small hotels. Track reservations, check availability, confirm bookings.',
    url: 'https://www.dineopen.com/products/hotel/bookings',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/hotel/bookings',
  },
};

export default function BookingsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Hotel Booking System",
    "description": "Calendar-based hotel booking management software with reservation tracking, availability checking, and booking confirmation/cancellation.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/hotel/bookings",
    "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Does DineOpen Hotel have a booking calendar?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The booking system includes a visual calendar view where you can see all reservations laid out by date. You can also switch to a list view for a tabular overview of bookings." } },
      { "@type": "Question", "name": "Can I confirm or cancel bookings?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Each booking can be confirmed or cancelled directly from the booking view. Status changes are tracked in the system and reflected immediately in room availability." } },
      { "@type": "Question", "name": "How do I check room availability for a date?", "acceptedAnswer": { "@type": "Answer", "text": "Use the date-based lookup feature. Select a date and the system shows all rooms with their status for that date, making it easy to find available rooms before creating a booking." } },
      { "@type": "Question", "name": "Can I navigate between months in the calendar?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The booking calendar supports month and year navigation. Jump to any month to see past or future bookings and plan your room inventory accordingly." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Hotel Management", "item": "https://www.dineopen.com/products/hotel" },
      { "@type": "ListItem", "position": 4, "name": "Bookings", "item": "https://www.dineopen.com/products/hotel/bookings" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BookingsClient />
    </>
  );
}
