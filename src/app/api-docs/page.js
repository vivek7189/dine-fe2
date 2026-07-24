import ApiDocsClient from './ApiDocsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'API & Integrations | Connect Your Restaurant Stack | DineOpen',
  description: 'DineOpen API and integrations for restaurants — connect POS, billing, inventory with Zomato, Swiggy, Razorpay, Stripe, WhatsApp, and more. REST API, webhooks, and third-party connectors.',
  keywords: 'restaurant API, POS API, restaurant integrations, Zomato integration, Swiggy integration, restaurant webhook, POS integration API, restaurant software API',
  openGraph: {
    title: 'API & Integrations | Connect Your Restaurant Stack | DineOpen',
    description: 'Connect DineOpen with Zomato, Swiggy, payment gateways, accounting tools, and more via REST API and pre-built integrations.',
    url: 'https://www.dineopen.com/api-docs',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API & Integrations | DineOpen',
    description: 'REST API, webhooks, and 20+ integrations for restaurant operations.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/api-docs',
  },
};

export default function ApiDocsPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen API & Integrations",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Integration Platform",
    "description": "REST API and pre-built integrations to connect DineOpen POS with food delivery platforms, payment gateways, accounting tools, and messaging services.",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/api-docs",
    "featureList": [
      "REST API for POS, orders, menu, and inventory",
      "Webhook notifications for real-time events",
      "Zomato and Swiggy order sync",
      "Razorpay and Stripe payment integration",
      "WhatsApp Business API for notifications",
      "Tally and accounting software export",
      "Multi-location API access"
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Does DineOpen have an API?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen provides a REST API that lets you programmatically access POS data, orders, menu items, inventory, customers, and reports. API access is available on the Pro plan." } },
      { "@type": "Question", "name": "Which food delivery platforms does DineOpen integrate with?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen integrates with Zomato and Swiggy for automatic order sync. Online orders appear directly in your POS — no manual entry needed. Menu and availability sync in real-time." } },
      { "@type": "Question", "name": "What payment gateways are supported?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen supports Razorpay and Stripe for online payments, UPI for direct bank transfers, and all major card terminals. Payment status syncs automatically with your billing system." } },
      { "@type": "Question", "name": "Can I get webhook notifications?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Configure webhooks to receive real-time HTTP callbacks when events occur — new order placed, payment received, inventory low, reservation created, and more. Use webhooks to connect DineOpen with your own systems." } },
      { "@type": "Question", "name": "Is there a setup fee for integrations?", "acceptedAnswer": { "@type": "Answer", "text": "No. All pre-built integrations (Zomato, Swiggy, Razorpay, WhatsApp) are included at no extra cost on the Pro plan. API access is also included. Custom integration support is available on request." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "API & Integrations", "item": "https://www.dineopen.com/api-docs" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ApiDocsClient />
    </>
  );
}
