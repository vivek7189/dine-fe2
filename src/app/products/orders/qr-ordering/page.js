import QrOrderingClient from './QrOrderingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'QR Code Ordering System for Restaurants | Scan to Order | DineOpen',
  description: 'QR code ordering for restaurants. Customers scan, browse menu, and order from their phone. No app download needed. Reduces wait time, cuts staffing costs, and increases order accuracy. Zero transaction fees.',
  keywords: 'QR code ordering, scan to order restaurant, QR menu ordering, contactless ordering, table QR code, self ordering restaurant, QR food ordering, digital menu QR',
  openGraph: {
    title: 'QR Code Ordering System | Scan to Order | DineOpen',
    description: 'Customers scan QR, browse menu, order from phone. No app needed. Zero transaction fees.',
    url: 'https://www.dineopen.com/products/orders/qr-ordering',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/orders/qr-ordering',
  },
};

export default function QrOrderingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen QR Code Ordering",
    "description": "QR code based self-ordering system for restaurants. Customers scan, browse, and order from their phone.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/orders/qr-ordering",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "QR code table ordering",
      "No app download required",
      "Real-time order sync",
      "Menu with images and modifiers",
      "Special instructions",
      "Multi-language support"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does QR code ordering work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Place a unique QR code at each table. Customers scan it with their phone camera, which opens your digital menu in their browser. They browse items, add modifiers, enter special instructions, and submit the order. It goes straight to your kitchen - no app download required."
        }
      },
      {
        "@type": "Question",
        "name": "Do customers need to download an app?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The QR code opens a web page in the customer's phone browser. They can browse the full menu, customize items, and place orders without downloading anything. This removes friction and works on any smartphone."
        }
      },
      {
        "@type": "Question",
        "name": "Can I have different QR codes for different tables?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Each table gets a unique QR code that identifies the table number. When customers scan and order, the kitchen automatically knows which table the order belongs to. You can generate and print QR codes from your DineOpen dashboard."
        }
      },
      {
        "@type": "Question",
        "name": "Does QR ordering reduce staff requirements?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It significantly reduces order-taking workload. Customers place orders themselves, so waiters focus on food delivery and customer service. Many restaurants report needing 30-40% fewer front-of-house staff with QR ordering."
        }
      },
      {
        "@type": "Question",
        "name": "Can customers reorder or add items to their order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Customers can scan the QR code again to add more items to their table's order. Each new order creates a separate KOT for the kitchen while keeping all items grouped under the same table for billing."
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
      { "@type": "ListItem", "position": 4, "name": "QR Ordering", "item": "https://www.dineopen.com/products/orders/qr-ordering" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <QrOrderingClient />
    </>
  );
}
