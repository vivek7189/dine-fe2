import FreeBillingClient from './FreeBillingClient';
import InternalLinks from '../../components/InternalLinks';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Billing Software | 7-Day Free Trial | DineOpen',
  description: 'Get free restaurant billing software with GST support, AI ordering, cloud POS, inventory management & more. Start your 7-day free trial today — no credit card required. Plans from $20/month ($215/year) internationally, or ₹299/month in India, after trial.',
  keywords: 'free restaurant billing software, free billing software for restaurant, free POS software, restaurant billing software free download, billing software free trial, free GST billing software, restaurant billing app free, free restaurant POS',
  openGraph: {
    title: 'Free Restaurant Billing Software | 7-Day Free Trial | DineOpen',
    description: 'Start billing your restaurant for free. Cloud POS, AI ordering, GST billing, inventory & more included in 7-day free trial. No credit card required.',
    url: 'https://www.dineopen.com/free-restaurant-billing-software',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Billing Software | DineOpen',
    description: 'Start billing your restaurant for free. Cloud POS, AI ordering, GST billing, inventory & more included in 7-day free trial.',
  },
  alternates: { canonical: 'https://www.dineopen.com/free-restaurant-billing-software' },
};

export default function FreeBillingSoftwarePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is there a free restaurant billing software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial of its complete restaurant billing software with all features included. No credit card is required to start. You get access to cloud POS, AI voice ordering, GST billing, inventory management, kitchen display system, analytics, and more — completely free during the trial period."
        }
      },
      {
        "@type": "Question",
        "name": "What is the best free billing software for restaurants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the best free billing software for restaurants. It includes AI-powered ordering, cloud POS, inventory management, GST-compliant billing, kitchen display system, waiter app, analytics dashboard, and a loyalty program — all available during the 7-day free trial with no restrictions or hidden fees."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use DineOpen billing software for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can use DineOpen billing software completely free for 7 days. After the trial, plans start at just $20/month for international restaurants or ₹299/month for Indian restaurants. There are no per-transaction fees, no hidden charges, and no long-term contracts required."
        }
      },
      {
        "@type": "Question",
        "name": "Does free billing software include GST?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen's free trial includes full GST compliance. You can generate GST-compliant invoices, automatically calculate CGST and SGST, manage HSN codes, and export tax reports for filing — all included at no cost during the 7-day trial period."
        }
      },
      {
        "@type": "Question",
        "name": "What features are included in the free trial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen's free trial includes every feature: AI Voice Agent for phone orders, Cloud POS for billing, Kitchen Display System (KDS), inventory management with low-stock alerts, waiter/captain app, customer loyalty program, real-time analytics dashboard, GST-compliant invoicing, QR code menus, and multi-language support. No features are locked during the trial."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FreeBillingClient />
    </>
  );
}
