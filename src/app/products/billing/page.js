import BillingLandingClient from './BillingLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Billing Software | GST Billing | DineOpen Billing',
  description: 'Complete restaurant billing software with GST compliant invoices, automatic tax calculation, HSN codes, and multiple payment methods. Supports Razorpay, UPI, cards, and digital wallets. Pricing from $9.99/mo.',
  keywords: 'restaurant billing software, GST billing software, restaurant invoice software, billing system restaurants, GST compliant billing, restaurant payment gateway, Razorpay restaurant, UPI billing',
  openGraph: {
    title: 'Restaurant Billing Software | GST Billing | DineOpen',
    description: 'GST-ready billing software for restaurants. Automatic tax calculation, HSN codes, multiple payment methods, and payment gateway integration.',
    url: 'https://www.dineopen.com/products/billing',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Billing Software | DineOpen Billing',
    description: 'GST compliant billing with automatic tax calculation, multiple payment methods, and payment gateway support.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/billing',
  },
};

export default function BillingPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Billing",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Billing Software",
    "description": "Complete restaurant billing solution with GST compliant invoices, automatic tax calculation, HSN codes, and multiple payment gateway integrations including Razorpay and Dodo.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/billing",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark plan - monthly" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Spark plan - monthly (India)" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "Blaze plan - monthly" },
      { "@type": "Offer", "price": "2500", "priceCurrency": "INR", "description": "Blaze plan - monthly (India)" }
    ],
    "featureList": [
      "Bill generation for orders",
      "GST compliant invoices with HSN codes",
      "Automatic tax calculation",
      "Multiple payment methods",
      "Tax record maintenance for GST filing",
      "Subscription management",
      "Payment gateway support (Razorpay, Dodo)"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "540"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Does DineOpen Billing support GST invoicing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen generates fully GST-compliant invoices with HSN codes, GSTIN display, and automatic CGST/SGST/IGST calculation based on your restaurant's location and customer state."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods does DineOpen Billing support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen supports cash, credit/debit cards, UPI (Google Pay, PhonePe, Paytm), digital wallets, and payment gateways like Razorpay and Dodo. Split payments across methods are also supported."
        }
      },
      {
        "@type": "Question",
        "name": "How much does DineOpen Billing cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Billing starts at $9.99/month (Rs.300/month in India) on the Spark plan. The Blaze plan at $89/month (Rs.2,500 in India) includes advanced features. Zero transaction fees on all plans."
        }
      },
      {
        "@type": "Question",
        "name": "Can I generate tax reports for GST filing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen maintains complete tax records and generates reports compatible with GSTR-1, GSTR-3B, and other GST filing formats. Export data in Excel or CSV for your accountant."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support multiple tax rates?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Configure different GST rates (5%, 12%, 18%, 28%) per item category. The system handles service tax, packaging charges, and delivery charges separately with proper tax treatment."
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
      { "@type": "ListItem", "position": 3, "name": "Billing", "item": "https://www.dineopen.com/products/billing" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BillingLandingClient />
    </>
  );
}
