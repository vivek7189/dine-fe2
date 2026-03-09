import ReservationsClient from './ReservationsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Reservation System | Online Table Booking | DineOpen',
  description: 'Online restaurant reservation system with date/time booking, party size matching, WhatsApp confirmations, and customer database. Accept bookings 24/7 from your website.',
  keywords: 'restaurant reservation system, online table booking, restaurant booking software, table reservation app, restaurant appointment system',
  openGraph: {
    title: 'Restaurant Reservation System | DineOpen',
    description: 'Online booking, WhatsApp confirmations, and smart table allocation for restaurants.',
    url: 'https://www.dineopen.com/products/tables/reservations',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/tables/reservations' },
};

export default function ReservationsPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Reservations",
    "applicationCategory": "BusinessApplication",
    "description": "Online restaurant reservation system with date/time booking, automatic table allocation, WhatsApp confirmations, and customer history tracking.",
    "url": "https://www.dineopen.com/products/tables/reservations",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR" }
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can customers book tables online?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Share your DineOpen booking page link on your website, Google My Business, Instagram, or WhatsApp. Customers select date, time, and party size. Booking confirmation is instant." } },
      { "@type": "Question", "name": "How are time slots managed?", "acceptedAnswer": { "@type": "Answer", "text": "You define available time slots, minimum/maximum booking durations, and buffer time between reservations. The system prevents double-booking and shows only available slots to customers." } },
      { "@type": "Question", "name": "Can I set booking limits?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Set maximum bookings per time slot, minimum advance booking time, and maximum party size. Block specific dates for private events or holidays." } },
      { "@type": "Question", "name": "Does it send booking reminders?", "acceptedAnswer": { "@type": "Answer", "text": "Automated reminders are sent via WhatsApp or SMS 2 hours before the reservation. No-show tracking helps identify unreliable bookers." } },
      { "@type": "Question", "name": "Can staff manage walk-in reservations?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Staff can add walk-in guests directly from the dashboard, assign tables, and track waiting time. The waitlist feature manages overflow during peak hours." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Tables", "item": "https://www.dineopen.com/products/tables" },
      { "@type": "ListItem", "position": 3, "name": "Reservations", "item": "https://www.dineopen.com/products/tables/reservations" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ReservationsClient />
    </>
  );
}
