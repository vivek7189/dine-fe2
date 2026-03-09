import PosLandingClient from './PosLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System | Point of Sale Software | DineOpen POS',
  description: 'DineOpen POS system for restaurants. Cloud-based point of sale with order management, multi-payment support, real-time updates, and multi-location management. Zero transaction fees. Plans from $9.99/mo.',
  keywords: 'restaurant POS system, point of sale software, restaurant POS, cloud POS, POS for restaurants, restaurant billing, order management system, multi-location POS',
  openGraph: {
    title: 'Restaurant POS System | Point of Sale Software | DineOpen POS',
    description: 'Cloud-based POS system with order management, multi-payment support, and real-time updates. Zero transaction fees.',
    url: 'https://www.dineopen.com/products/pos',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS System | DineOpen POS',
    description: 'Cloud-based POS with order management, multi-payment, and real-time updates. Zero transaction fees.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/pos',
  },
};

export default function PosPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen POS System",
    "description": "Cloud-based point of sale system for restaurants with order management, multi-payment support, real-time updates via Pusher, and multi-location management.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "url": "https://www.dineopen.com/products/pos",
    "offers": [
      {
        "@type": "Offer",
        "name": "Spark",
        "price": "9.99",
        "priceCurrency": "USD",
        "description": "Essential POS for single-location restaurants"
      },
      {
        "@type": "Offer",
        "name": "Blaze",
        "price": "89",
        "priceCurrency": "USD",
        "description": "Full-featured POS for growing restaurant businesses"
      }
    ],
    "featureList": [
      "Interactive menu browsing and order creation",
      "Shopping cart with quantity management",
      "Category-based menu browsing with search",
      "Quick search and short code search",
      "Order types: dine-in, takeout, delivery, room service",
      "Table and room selection",
      "Saved orders queue",
      "Payment method selection (cash, card, UPI)",
      "Order confirmation with receipt printing",
      "Real-time updates via Pusher",
      "Tax calculations",
      "Multi-location restaurant switching",
      "Demo mode"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "520"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a restaurant POS system?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A restaurant POS (Point of Sale) system is software that handles order taking, payment processing, and restaurant operations from a single interface. DineOpen POS supports dine-in, takeout, delivery, and room service orders with real-time kitchen sync."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen POS charge transaction fees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen charges zero transaction fees on all plans. You only pay the monthly subscription - Spark at $9.99/mo or Blaze at $89/mo. Every dollar your restaurant earns stays with you."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use DineOpen POS on my phone or tablet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS is fully cloud-based and works on any device with a browser - phones, tablets, laptops, or desktops. No special hardware required. Your staff can take orders from their own devices."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen POS support multiple payment methods?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS supports cash, credit/debit cards, and UPI payments. You can select the payment method at checkout and the system records it for your accounting."
        }
      },
      {
        "@type": "Question",
        "name": "Can I manage multiple restaurant locations with DineOpen POS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS includes built-in multi-location support. Switch between restaurant locations from the POS interface, manage separate menus and staff for each, and view consolidated reports across all locations."
        }
      },
      {
        "@type": "Question",
        "name": "How does the real-time update feature work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen uses Pusher for real-time websocket connections. When an order is placed, kitchen staff see it instantly on their screen. When the kitchen marks an order ready, the waiter is notified immediately. No page refreshing needed."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a demo mode to try before committing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS includes a built-in demo mode with sample menu items and mock data. You can explore the full POS interface, create test orders, and experience the workflow before adding your own restaurant data."
        }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen POS compare to Petpooja or Square?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen offers zero transaction fees (Square charges 2.6%+10c per transaction), no hardware lock-in (unlike Petpooja), and affordable plans starting at $9.99/mo. DineOpen also includes multi-location support and real-time updates on all plans."
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
      { "@type": "ListItem", "position": 3, "name": "POS System", "item": "https://www.dineopen.com/products/pos" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PosLandingClient />
    </>
  );
}
