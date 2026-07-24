import OrdersLandingClient from './OrdersLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Online Ordering System for Restaurants | QR Code & Delivery | DineOpen Orders',
  description: 'Complete online ordering system for restaurants. QR code ordering, WhatsApp orders, delivery management, order history with search, invoice generation. Real-time order tracking with zero transaction fees.',
  keywords: 'online ordering system restaurant, QR code ordering, restaurant delivery management, WhatsApp ordering, order management system, restaurant order tracking, digital ordering, contactless ordering restaurant',
  openGraph: {
    title: 'Online Ordering System for Restaurants | DineOpen Orders',
    description: 'QR code ordering, online orders, delivery management, WhatsApp orders - all in one system. Zero transaction fees.',
    url: 'https://www.dineopen.com/products/orders',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-orders.jpg', width: 1200, height: 630, alt: 'DineOpen Orders System' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Ordering System | DineOpen Orders',
    description: 'QR ordering, online orders, delivery - zero transaction fees. Complete order management for restaurants.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/orders',
  },
};

export default function OrdersPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Orders",
    "description": "Complete online ordering system for restaurants with QR code ordering, WhatsApp orders, delivery management, and real-time order tracking.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "url": "https://www.dineopen.com/products/orders",
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter",
        "price": "20",
        "priceCurrency": "USD",
        "description": "$20/mo or ₹299/mo in India"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "99",
        "priceCurrency": "USD",
        "description": "$99/mo or ₹1,799/mo in India"
      }
    ],
    "featureList": [
      "Online ordering",
      "QR code ordering",
      "WhatsApp ordering",
      "Order history search",
      "Status filtering",
      "Invoice generation",
      "Order printing",
      "Real-time updates"
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
        "name": "How does QR code ordering work for restaurants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers scan a QR code at their table using their phone camera. This opens your restaurant's digital menu where they browse items, customize orders, and place them directly. The order goes straight to your kitchen display - no app download needed by the customer."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen charge transaction fees on orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen charges zero transaction fees on all orders - online, QR, dine-in, takeout, or delivery. You pay only your monthly subscription. Unlike platforms that take 15-30% per order, every rupee of revenue stays with you."
        }
      },
      {
        "@type": "Question",
        "name": "Can customers order via WhatsApp?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen supports WhatsApp ordering where customers can browse your menu and place orders through WhatsApp. Orders flow into the same order management system alongside dine-in and online orders."
        }
      },
      {
        "@type": "Question",
        "name": "How do I search and filter past orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Orders includes powerful search by order ID, customer name, or table number. Filter by status (pending, completed, cancelled) or order type (dine-in, takeout, delivery, room service). Switch between compact and expanded views for quick scanning."
        }
      },
      {
        "@type": "Question",
        "name": "Can I generate and download invoices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen generates professional invoices for every order. You can download, print, or share invoices with customers. Invoices include all order details, taxes, discounts, and payment information."
        }
      },
      {
        "@type": "Question",
        "name": "Are orders updated in real-time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen uses Pusher real-time technology so new orders appear instantly, status changes sync across all devices, and kitchen staff see updates without refreshing. This works for all order types - online, QR, WhatsApp, and dine-in."
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
      { "@type": "ListItem", "position": 3, "name": "Orders", "item": "https://www.dineopen.com/products/orders" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <OrdersLandingClient />
    </>
  );
}
