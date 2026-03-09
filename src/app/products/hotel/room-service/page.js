import RoomServiceClient from './RoomServiceClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Hotel Room Service Ordering System | In-Room Dining Software | DineOpen',
  description: 'Hotel room service ordering system integrated with restaurant POS. In-room dining orders sent directly to kitchen via KOT. Charges added to guest folio automatically. For small hotels.',
  keywords: 'hotel room service software, in-room dining system, room service ordering, hotel KOT system, room service POS integration, hotel food ordering, guest room dining',
  openGraph: {
    title: 'Hotel Room Service Ordering System | DineOpen',
    description: 'In-room dining orders integrated with restaurant POS and kitchen. KOT sent directly to kitchen, charges on guest folio.',
    url: 'https://www.dineopen.com/products/hotel/room-service',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/hotel/room-service',
  },
};

export default function RoomServicePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Hotel Room Service System",
    "description": "Room service ordering system for hotels integrated with restaurant POS. Orders sent to kitchen via KOT, charges added to guest folio automatically.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/hotel/room-service",
    "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How does room service work with the POS?", "acceptedAnswer": { "@type": "Answer", "text": "Room service orders are placed from the hotel check-in screen and sent to the kitchen as KOTs (Kitchen Order Tickets), just like dine-in restaurant orders. The kitchen prepares the food and staff delivers it to the room. All charges are automatically added to the guest's folio." } },
      { "@type": "Question", "name": "Can guests order from the full restaurant menu?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Room service uses the same menu as the restaurant POS. Guests can order any available item. Staff can also add special instructions or modifications to orders." } },
      { "@type": "Question", "name": "Are room service charges included in the final invoice?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. All room service orders are tracked per room and guest. At check-out, the invoice includes an itemized list of all room service orders alongside the room charges." } },
      { "@type": "Question", "name": "Do I need a separate system for room service?", "acceptedAnswer": { "@type": "Answer", "text": "No. Room service is built into DineOpen Hotel and integrated with the DineOpen restaurant POS. There is no separate software to install or configure." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Hotel Management", "item": "https://www.dineopen.com/products/hotel" },
      { "@type": "ListItem", "position": 4, "name": "Room Service", "item": "https://www.dineopen.com/products/hotel/room-service" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <RoomServiceClient />
    </>
  );
}
