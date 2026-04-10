import IntegrationsLandingClient from './IntegrationsLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Integrations | Zomato, Swiggy, Razorpay & More | DineOpen',
  description: 'Connect your restaurant POS with Zomato, Swiggy, Razorpay, and more. Auto-accept aggregator orders, sync menus, accept UPI payments, and manage everything from one dashboard. Free integrations with DineOpen.',
  keywords: 'restaurant POS integrations, Zomato POS integration, Swiggy POS integration, Razorpay restaurant, food aggregator integration, restaurant payment gateway, POS Zomato Swiggy, restaurant software integrations India',
  openGraph: {
    title: 'Restaurant POS Integrations | Zomato, Swiggy, Razorpay | DineOpen',
    description: 'Connect with Zomato, Swiggy, Razorpay & more. Auto-accept orders, sync menus, manage payments from one dashboard.',
    url: 'https://www.dineopen.com/products/integrations',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS Integrations | DineOpen',
    description: 'Zomato, Swiggy, Razorpay integrations for restaurants. Auto-accept orders, sync menus, one dashboard.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/integrations',
  },
};

export default function IntegrationsPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Integrations",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant POS Integrations",
    "description": "Connect your restaurant POS with food delivery aggregators like Zomato and Swiggy, payment gateways like Razorpay, and more. Auto-accept orders, sync menus, and manage everything from one dashboard.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/integrations",
    "offers": [
      { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Integrations included free with all plans" }
    ],
    "featureList": [
      "Zomato order integration",
      "Swiggy order integration",
      "Razorpay payment gateway",
      "Auto-accept aggregator orders",
      "Real-time menu sync",
      "Unified order dashboard",
      "Inventory sync across platforms",
      "Settlement tracking and reconciliation"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "480"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which food delivery platforms does DineOpen integrate with?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen integrates with Zomato and Swiggy, India's two largest food delivery platforms. Orders from both platforms flow directly into your POS — no manual entry or switching between apps."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to pay extra for integrations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All integrations are included free with every DineOpen plan. There are no setup fees, no per-order charges, and no hidden costs for connecting Zomato, Swiggy, or Razorpay."
        }
      },
      {
        "@type": "Question",
        "name": "How does auto-accept work for Zomato and Swiggy orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When enabled, DineOpen automatically accepts incoming orders from Zomato and Swiggy and sends them directly to your kitchen display or printer. No staff member needs to manually accept each order, eliminating missed orders and delays."
        }
      },
      {
        "@type": "Question",
        "name": "Can I sync my menu across Zomato, Swiggy, and dine-in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Update your menu once in DineOpen and it syncs automatically to Zomato and Swiggy. Item availability, pricing, and descriptions stay consistent across all platforms. Mark items out of stock and they go offline everywhere instantly."
        }
      },
      {
        "@type": "Question",
        "name": "What payment gateways does DineOpen support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen integrates with Razorpay for accepting online payments via UPI, credit/debit cards, net banking, and digital wallets. Settlement tracking and automatic reconciliation are built in."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to set up integrations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most integrations can be connected in under 10 minutes. Link your Zomato or Swiggy merchant account in DineOpen settings, configure your preferences, and you're live. No technical knowledge required."
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
      { "@type": "ListItem", "position": 3, "name": "Integrations", "item": "https://www.dineopen.com/products/integrations" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <IntegrationsLandingClient />
    </>
  );
}
