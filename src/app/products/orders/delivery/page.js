import DeliveryClient from './DeliveryClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Delivery Order Management for Restaurants | DineOpen',
  description: 'Manage delivery orders for your restaurant. Track delivery status, manage addresses, assign drivers, generate invoices. Integrate with your own delivery fleet or third-party services. Zero commissions.',
  keywords: 'restaurant delivery management, delivery order system, food delivery software, restaurant delivery tracking, delivery management system, own delivery restaurant, delivery order tracking',
  openGraph: {
    title: 'Delivery Order Management | DineOpen',
    description: 'Manage delivery orders, track status, assign drivers. Zero commissions on all delivery orders.',
    url: 'https://www.dineopen.com/products/orders/delivery',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/orders/delivery',
  },
};

export default function DeliveryPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Delivery Management",
    "description": "Delivery order management system for restaurants with status tracking, address management, and invoice generation.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/orders/delivery",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Delivery order management",
      "Status tracking",
      "Address management",
      "Invoice generation",
      "Real-time updates",
      "Order history"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does DineOpen handle delivery orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Delivery orders flow into DineOpen just like dine-in orders but with delivery-specific fields: customer address, phone number, delivery notes, and estimated delivery time. Orders are tagged as delivery type so kitchen staff can prioritize packaging."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen charge commission on delivery orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen charges zero commissions on all orders including delivery. You pay only your flat monthly subscription. This is unlike delivery platforms that take 15-30% of every order."
        }
      },
      {
        "@type": "Question",
        "name": "Can I track delivery order status?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Delivery orders have full status tracking: pending, preparing, ready for pickup, out for delivery, and delivered. Status updates sync in real-time across all devices."
        }
      },
      {
        "@type": "Question",
        "name": "Can I generate invoices for delivery orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen generates invoices for every order including delivery. Invoices include itemized details, delivery charges, taxes, and discounts. Download, print, or share via WhatsApp."
        }
      },
      {
        "@type": "Question",
        "name": "How do customers place delivery orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers can place delivery orders through your online ordering page, WhatsApp, or by calling your restaurant. Staff can also enter delivery orders directly in the POS. All delivery orders go to the same dashboard."
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
      { "@type": "ListItem", "position": 3, "name": "Orders", "item": "https://www.dineopen.com/products/orders" },
      { "@type": "ListItem", "position": 4, "name": "Delivery", "item": "https://www.dineopen.com/products/orders/delivery" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DeliveryClient />
    </>
  );
}
