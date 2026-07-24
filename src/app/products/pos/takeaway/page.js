import TakeawayClient from './TakeawayClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Takeaway POS System | Takeout Ordering Software | DineOpen',
  description: 'Takeaway POS system for restaurants. Manage takeout orders, packaging, delivery integration, and quick checkout. Separate takeaway queue, receipt printing, and real-time order tracking. From $20/mo.',
  keywords: 'takeaway POS system, takeout POS software, takeaway ordering system, takeout restaurant POS, delivery POS, pickup order management',
  openGraph: {
    title: 'Takeaway POS System | Takeout Ordering Software | DineOpen',
    description: 'Manage takeout orders, delivery, and quick checkout with DineOpen takeaway POS.',
    url: 'https://www.dineopen.com/products/pos/takeaway',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/pos/takeaway',
  },
};

export default function TakeawayPosPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Takeaway POS",
    "description": "POS system optimized for takeaway and delivery restaurant operations.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/pos/takeaway",
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
        "name": "What is a takeaway POS system?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A takeaway POS system is designed specifically for restaurants that handle takeout and delivery orders. It includes features like order queuing, packaging tracking, delivery management, and fast checkout optimized for high-volume takeaway operations."
        }
      },
      {
        "@type": "Question",
        "name": "Can I manage both takeaway and dine-in orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS supports takeaway, dine-in, delivery, and room service order types in one unified system. You can switch between order types from the same interface and manage them in a single queue."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support delivery order management?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS includes a dedicated delivery order flow where you can capture delivery addresses, assign riders, and track order status from preparation to delivery."
        }
      },
      {
        "@type": "Question",
        "name": "How does the saved orders queue work for takeaway?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The saved orders queue lets you park in-progress orders and recall them later. This is useful when a customer calls ahead to place an order - you can save it and process payment when they arrive for pickup."
        }
      },
      {
        "@type": "Question",
        "name": "Can customers pay with UPI for takeaway orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS supports cash, card, and UPI payments for all order types including takeaway. The payment method is recorded with each order for your accounting records."
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
      { "@type": "ListItem", "position": 4, "name": "Takeaway POS", "item": "https://www.dineopen.com/products/pos/takeaway" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <TakeawayClient />
    </>
  );
}
