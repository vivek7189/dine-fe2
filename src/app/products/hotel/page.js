import HotelLandingClient from './HotelLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Hotel Management Software for Small Hotels | Room Booking System | DineOpen Hotel',
  description: 'Affordable hotel management software for small hotels, boutique stays, and hotel-restaurants. Room booking, check-in/check-out, housekeeping, room service, and invoice generation. Cloud-based PMS from $9.99/month.',
  keywords: 'hotel management software, small hotel software, hotel PMS, room booking system, hotel check-in software, hotel room management, boutique hotel software, hotel restaurant management, hotel billing software, property management system small hotel',
  openGraph: {
    title: 'Hotel Management Software for Small Hotels | DineOpen Hotel',
    description: 'Complete hotel management with rooms, bookings, check-in/out, housekeeping, and room service. Built for small hotels and hotel-restaurants.',
    url: 'https://www.dineopen.com/products/hotel',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-hotel.jpg', width: 1200, height: 630, alt: 'DineOpen Hotel Management Software' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Management Software for Small Hotels | DineOpen Hotel',
    description: 'Complete hotel management with rooms, bookings, check-in/out, housekeeping, and room service.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/hotel',
  },
};

export default function HotelPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Hotel Management Software",
    "description": "Cloud-based hotel management software for small hotels, boutique stays, and hotel-restaurants. Includes room management, booking system, check-in/check-out, housekeeping, room service, and invoice generation.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "url": "https://www.dineopen.com/products/hotel",
    "offers": [
      {
        "@type": "Offer",
        "name": "Spark Plan",
        "price": "9.99",
        "priceCurrency": "USD",
        "description": "Hotel management for small properties"
      },
      {
        "@type": "Offer",
        "name": "Blaze Plan",
        "price": "89",
        "priceCurrency": "USD",
        "description": "Full hotel management with advanced features"
      }
    ],
    "featureList": [
      "Room inventory management",
      "Booking calendar view",
      "Check-in and check-out",
      "Guest profile management",
      "Room service ordering",
      "Housekeeping scheduling",
      "Invoice generation and printing",
      "Room status tracking",
      "Maintenance scheduling",
      "Date-based availability"
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DineOpen Hotel management software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Hotel is a cloud-based hotel management module integrated into the DineOpen POS system. It is designed for small hotels, boutique stays, and hotel-restaurants to manage rooms, bookings, check-ins, housekeeping, room service, and invoicing from a single dashboard."
        }
      },
      {
        "@type": "Question",
        "name": "Is DineOpen Hotel a full hotel booking engine like Booking.com?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen Hotel is a property management tool for small hotel operators to manage their day-to-day operations including room inventory, guest check-ins, housekeeping, and room service. It is not an online travel agency or booking marketplace."
        }
      },
      {
        "@type": "Question",
        "name": "How much does DineOpen Hotel cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Hotel starts at $9.99/month (Spark Plan) or Rs 300/month in India. The Blaze Plan at $89/month (Rs 2,500/month in India) includes advanced features for larger properties."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use DineOpen Hotel without the restaurant POS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Hotel works as a module within the DineOpen platform. While it is designed to integrate with the restaurant POS for room service and billing, you can use the hotel features independently for room and booking management."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen Hotel support room service ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Room service orders are integrated with the restaurant POS and kitchen order ticket (KOT) system. Staff can place food orders for guests directly from the check-in screen, and orders flow to the kitchen just like dine-in orders."
        }
      },
      {
        "@type": "Question",
        "name": "How does housekeeping management work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can schedule maintenance and cleaning tasks for rooms, track room status (clean, dirty, maintenance), and update room availability. Staff can filter rooms by status and manage turnover between guests."
        }
      },
      {
        "@type": "Question",
        "name": "Can I add rooms in bulk?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen Hotel supports both single room addition and bulk room creation. You can add multiple rooms at once with room type, floor, and pricing details to quickly set up your property."
        }
      },
      {
        "@type": "Question",
        "name": "Who is DineOpen Hotel best suited for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Hotel is ideal for small hotels (under 50 rooms), boutique hotels, guest houses, hotel-restaurants, lodges, dharamshalas, and small resorts that need simple, affordable property management without the complexity of enterprise PMS systems."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Hotel Management", "item": "https://www.dineopen.com/products/hotel" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <HotelLandingClient />
    </>
  );
}
