import SmallRestaurantsClient from './SmallRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS for Small Restaurants | Affordable POS System | DineOpen',
  description: 'Affordable POS system for small restaurants starting at $20/mo (₹299 in India). Easy setup, no hardware required, essential features included. Perfect for restaurants, cafes, and food trucks with limited budgets.',
  keywords: 'POS for small restaurants, affordable restaurant POS, cheap POS system, small restaurant POS software, budget restaurant POS, simple POS system',
  openGraph: {
    title: 'POS for Small Restaurants | Affordable POS System | DineOpen',
    description: 'Affordable POS starting at $20/mo. Easy setup, no hardware, essential features for small restaurants.',
    url: 'https://www.dineopen.com/products/pos/small-restaurants',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/pos/small-restaurants',
  },
};

export default function SmallRestaurantsPosPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen POS for Small Restaurants",
    "description": "Affordable, easy-to-use POS system designed for small restaurants, cafes, and food trucks. No hardware required.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/pos/small-restaurants",
    "offers": {
      "@type": "Offer",
      "price": "20",
      "priceCurrency": "USD",
      "description": "Starter plan for small restaurants"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does DineOpen POS cost for small restaurants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Starter plan costs $20/mo (₹299/mo in India). It includes full POS functionality with all order types, multi-payment support, receipt printing, and tax calculations. Zero transaction fees - you keep every dollar you earn."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to buy special hardware?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen runs in any web browser on your existing phone, tablet, or laptop. You do not need to purchase proprietary POS terminals. If you want receipt printing, any standard Bluetooth or USB receipt printer works."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to set up DineOpen for a small restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most small restaurants are up and running in under 30 minutes. Sign up, add your menu items, configure your tables, and start taking orders. There is also a demo mode to explore the system before adding your own data."
        }
      },
      {
        "@type": "Question",
        "name": "Is DineOpen too complex for a small restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. While DineOpen has powerful features, the interface is designed to be intuitive. Small restaurants typically use the core features - menu browsing, order taking, and payment processing - which are straightforward and require minimal training."
        }
      },
      {
        "@type": "Question",
        "name": "Can I upgrade later if my restaurant grows?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Start with the Starter plan at $20/mo and upgrade to Pro at $99/mo when you need multi-location support, real-time Pusher updates, and priority support. All your data carries over - no migration needed."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work for food trucks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen POS runs on your phone, making it ideal for food trucks. Take orders, process payments, and print receipts from a mobile device. The takeaway order type is perfect for food truck operations."
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
      { "@type": "ListItem", "position": 4, "name": "Small Restaurants", "item": "https://www.dineopen.com/products/pos/small-restaurants" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SmallRestaurantsClient />
    </>
  );
}
