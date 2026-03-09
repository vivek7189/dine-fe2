import DisplayClient from './DisplayClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Kitchen Display System for Restaurants | Real-Time KDS Screens | DineOpen',
  description: 'Real-time kitchen display screens for restaurants. Sound notifications, cooking timers, color-coded order statuses, date filtering. Mount on any screen - tablet, TV, or monitor. No special hardware needed.',
  keywords: 'kitchen display system, KDS screen, restaurant kitchen screen, kitchen monitor, real-time kitchen display, kitchen TV display, cooking timer display, order status screen, digital kitchen board',
  openGraph: {
    title: 'Kitchen Display System for Restaurants | DineOpen',
    description: 'Real-time kitchen display with sound alerts, cooking timers, and color-coded statuses. Works on any screen.',
    url: 'https://www.dineopen.com/products/kitchen/display',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/kitchen/display',
  },
};

export default function DisplayPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Kitchen Display",
    "description": "Real-time kitchen display system with sound notifications, cooking timers, and color-coded order statuses for restaurants.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/kitchen/display",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Real-time order display",
      "Sound notifications",
      "Cooking timers",
      "Color-coded order statuses",
      "Date-based filtering",
      "Works on any screen"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What screen size works best for a kitchen display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Kitchen Display is responsive and works on any screen. For busy kitchens, a 22-inch or larger monitor or TV is ideal. Smaller kitchens do well with a 10-inch tablet. The interface auto-adjusts to screen size."
        }
      },
      {
        "@type": "Question",
        "name": "How do sound notifications work on the display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When a new order arrives, the display plays an audible alert through the device speakers. This ensures kitchen staff notice new orders even when focused on cooking. The sound can be adjusted or muted."
        }
      },
      {
        "@type": "Question",
        "name": "Are orders updated in real-time on the display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen uses Pusher real-time technology to push order updates instantly. New orders appear immediately, status changes reflect in real-time, and completed orders move off the active view - all without refreshing."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use a smart TV as a kitchen display?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Any smart TV with a web browser works. You can also connect a Chromecast, Fire Stick, or a mini PC to a regular TV. Open the DineOpen KDS URL in the browser and you have a full kitchen display."
        }
      },
      {
        "@type": "Question",
        "name": "What do the color codes on the display mean?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Orders are color-coded by status: pending orders appear in one color, in-progress in another, and ready orders are highlighted for quick pickup. This visual system lets kitchen staff assess the state of all orders at a glance."
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
      { "@type": "ListItem", "position": 3, "name": "Kitchen", "item": "https://www.dineopen.com/products/kitchen" },
      { "@type": "ListItem", "position": 4, "name": "Display", "item": "https://www.dineopen.com/products/kitchen/display" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DisplayClient />
    </>
  );
}
