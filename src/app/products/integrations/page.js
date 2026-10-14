import IntegrationsLandingClient from './IntegrationsLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Integrations | Razorpay, Talabat & Delivery Sales Tracking | DineOpen',
  description: 'DineOpen integrates with Razorpay for UPI and card payments and with Talabat in the Gulf. Record Zomato and Swiggy orders on the POS and track them separately in reports (no automatic Zomato/Swiggy sync today).',
  keywords: 'restaurant POS integrations, Razorpay restaurant, Talabat POS integration, Zomato Swiggy sales tracking, restaurant payment gateway, commission-free online ordering, restaurant software integrations India',
  openGraph: {
    title: 'Restaurant POS Integrations | Razorpay, Talabat | DineOpen',
    description: 'Razorpay payments, Talabat orders in the Gulf, and Zomato/Swiggy sales tracked separately in your reports.',
    url: 'https://www.dineopen.com/products/integrations',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant POS Integrations | DineOpen',
    description: 'Razorpay and Talabat integrations, plus Zomato/Swiggy sales tracking in reports.',
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
    "description": "Restaurant POS integrations: Razorpay payment gateway and Talabat order sync (UAE/Gulf). Zomato and Swiggy orders are recorded on the POS and tracked separately in reports; DineOpen does not sync them automatically today.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/integrations",
    "offers": [
      { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Integrations included free with all plans" }
    ],
    "featureList": [
      "Razorpay payment gateway",
      "Talabat order sync (UAE/Gulf)",
      "Zomato and Swiggy sales tracking in reports (manual order entry)",
      "Commission-free QR, website and WhatsApp ordering",
      "Unified sales reports by channel",
      "Settlement tracking and reconciliation"
    ]
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
          "text": "Talabat (UAE and Gulf) is integrated - Talabat orders arrive in DineOpen automatically. DineOpen does not sync Zomato or Swiggy orders automatically today: staff record those orders on the POS and mark the channel as Zomato or Swiggy, so aggregator sales show separately in your reports."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to pay extra for integrations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Integrations such as Razorpay are included with every DineOpen plan. There are no setup fees and no per-order charges from DineOpen."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen auto-accept Zomato and Swiggy orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. There is no automatic order import or auto-accept for Zomato or Swiggy today. Staff enter those orders on the DineOpen POS, which sends a KOT to the kitchen and tracks the sale under the right channel."
        }
      },
      {
        "@type": "Question",
        "name": "Can I sync my menu to Zomato and Swiggy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not today. Your DineOpen menu powers your POS, QR menu, branded online ordering website and WhatsApp ordering. Zomato and Swiggy menus are managed in their own partner apps."
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
          "text": "Most integrations can be connected in under 10 minutes. Link your Razorpay account in DineOpen settings, configure your preferences, and you're live. No technical knowledge required."
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
