import KitchenLandingClient from './KitchenLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Kitchen Display System KDS | Restaurant KOT Software | DineOpen Kitchen',
  description: 'Free kitchen display system (KDS) for restaurants. Real-time KOT management, cooking timers, sound notifications, order status tracking. Replace paper tickets with digital kitchen screens. Works on any device.',
  keywords: 'kitchen display system, KDS restaurant, KOT software, kitchen order ticket, restaurant kitchen management, digital kitchen display, cooking timer, order tracking kitchen, kitchen screen restaurant, KDS software free',
  openGraph: {
    title: 'Kitchen Display System KDS | Restaurant KOT Software | DineOpen Kitchen',
    description: 'Digital kitchen display with real-time KOT management, cooking timers, and sound alerts. Free with DineOpen POS.',
    url: 'https://www.dineopen.com/products/kitchen',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-kitchen.jpg', width: 1200, height: 630, alt: 'DineOpen Kitchen Display System' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitchen Display System KDS | DineOpen Kitchen',
    description: 'Digital KDS with real-time order tracking, cooking timers, and sound notifications. Free with DineOpen.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/kitchen',
  },
};

export default function KitchenPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Kitchen Display System",
    "description": "Digital kitchen display system with real-time KOT management, cooking timers, sound notifications, and order status tracking for restaurants.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "url": "https://www.dineopen.com/products/kitchen",
    "offers": [
      {
        "@type": "Offer",
        "name": "Spark",
        "price": "9.99",
        "priceCurrency": "USD",
        "description": "Perfect for small restaurants - $9.99/mo or ₹300/mo in India"
      },
      {
        "@type": "Offer",
        "name": "Blaze",
        "price": "89",
        "priceCurrency": "USD",
        "description": "For multi-location restaurants - $89/mo or ₹2,500/mo in India"
      }
    ],
    "featureList": [
      "Real-time kitchen order tickets (KOT)",
      "Order status filtering",
      "Cooking timers",
      "Sound notifications for new orders",
      "Order status transitions",
      "Print receipt functionality",
      "Real-time updates via Pusher",
      "Date-based order filtering"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "380"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a Kitchen Display System (KDS)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Kitchen Display System (KDS) replaces paper tickets in your kitchen with a digital screen that shows orders in real-time. Orders appear automatically when waiters submit them, with color-coded statuses, cooking timers, and sound alerts so your kitchen never misses an order."
        }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen Kitchen compare to FreshKDS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Kitchen includes cooking timers, sound notifications, real-time Pusher updates, order deletion with reasons, and print receipts - all included in the base plan. FreshKDS charges separately for many of these features. DineOpen starts at $9.99/mo vs FreshKDS at $29/mo."
        }
      },
      {
        "@type": "Question",
        "name": "Can I filter orders by status in the kitchen display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen Kitchen lets you filter orders by status: all orders, pending, in-progress, ready, and completed. You can also filter by date - today only, last 24 hours, or all orders. This keeps your kitchen screen clean and focused."
        }
      },
      {
        "@type": "Question",
        "name": "Does the KDS support sound notifications?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! DineOpen Kitchen plays sound alerts when new orders arrive so kitchen staff never miss an incoming ticket, even during busy rushes. Sound can be customized or muted based on your kitchen environment."
        }
      },
      {
        "@type": "Question",
        "name": "Can I print KOT tickets from the kitchen display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. While the digital display reduces paper usage, you can still print individual KOT tickets or receipts when needed. This is useful for expediting or for kitchens transitioning from paper to digital workflows."
        }
      },
      {
        "@type": "Question",
        "name": "What devices can run the kitchen display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Kitchen runs on any device with a web browser - tablets, monitors, TVs, laptops, or even phones. Mount a tablet or connect a TV in your kitchen and open the KDS in a browser. No special hardware required."
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
      { "@type": "ListItem", "position": 3, "name": "Kitchen", "item": "https://www.dineopen.com/products/kitchen" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <KitchenLandingClient />
    </>
  );
}
