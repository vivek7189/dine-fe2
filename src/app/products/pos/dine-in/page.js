import DineInClient from './DineInClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Dine-In POS System | Table Management & Ordering | DineOpen',
  description: 'Dine-in POS system with table selection, floor management, and tableside ordering. Visual table layout, manual table entry, room service support, and real-time kitchen sync. From $20/mo.',
  keywords: 'dine-in POS system, table management POS, restaurant table ordering, tableside POS, floor plan POS, table selection POS, sit-down restaurant POS',
  openGraph: {
    title: 'Dine-In POS System | Table Management & Ordering | DineOpen',
    description: 'Table management, floor view, and tableside ordering. Real-time kitchen sync for dine-in restaurants.',
    url: 'https://www.dineopen.com/products/pos/dine-in',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/pos/dine-in',
  },
};

export default function DineInPosPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Dine-In POS",
    "description": "POS system with table selection, floor management, and tableside ordering for dine-in restaurants.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/pos/dine-in",
    "offers": {
      "@type": "Offer",
      "price": "20",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does table selection work in DineOpen POS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When you select 'Dine-In' as the order type, DineOpen shows available tables for selection. You can pick from the visual table list or manually enter a table number. The order is then linked to that table for tracking and billing."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support room service for hotels?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS includes a dedicated room service order type. Select 'Room Service', choose or enter a room number, and the order is linked to that room. The kitchen receives the KOT with room details for delivery."
        }
      },
      {
        "@type": "Question",
        "name": "Can waiters take orders at the table?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS works on any device including phones and tablets. Waiters can browse the menu, add items, and submit orders directly from the customer's table. Orders sync to the kitchen display in real time."
        }
      },
      {
        "@type": "Question",
        "name": "How do saved orders work for dine-in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The saved orders queue lets you park an order and return to it later. This is useful when guests are still deciding or when you need to add items to an existing table's order. Recall the saved order, add items, and process when ready."
        }
      },
      {
        "@type": "Question",
        "name": "Can I enter table numbers manually?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen supports both visual table selection from a list and manual table number entry. If you have outdoor seating or temporary tables not in your layout, simply type the table number directly."
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
      { "@type": "ListItem", "position": 3, "name": "POS System", "item": "https://www.dineopen.com/products/pos" },
      { "@type": "ListItem", "position": 4, "name": "Dine-In POS", "item": "https://www.dineopen.com/products/pos/dine-in" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DineInClient />
    </>
  );
}
