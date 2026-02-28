import CateringClient from './CateringClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Catering Business India | Wedding & Corporate | DineOpen',
  description: 'Best software for catering businesses in India. Wedding catering, corporate events, bulk orders, menu planning, advance bookings, GST invoicing. ₹999/month.',
  keywords: 'catering software India, wedding catering billing, corporate catering POS, bulk order management, caterer billing software, event catering software',
  openGraph: {
    title: 'POS Software for Catering Business India | DineOpen',
    description: 'Best software for caterers with bulk order management, advance bookings, and menu planning.',
    url: 'https://www.dineopen.com/for/catering',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/catering' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS software for catering businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best software for catering businesses, offering bulk order management, advance bookings, menu planning, and GST invoicing for weddings and corporate events."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage advance bookings for catering events?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports advance event bookings with deposit tracking, menu customization, and guest count management. Perfect for planning wedding and corporate catering."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen handle bulk order billing for caterers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen simplifies bulk order billing with per-plate pricing, package deals, and itemized invoicing. You can generate GST-compliant invoices for large catering orders."
      }
    },
    {
      "@type": "Question",
      "name": "How much does catering management software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Catering features like advance bookings and bulk order management are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for catering businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to explore core features. Upgrade to access advance booking management, bulk invoicing, and event planning tools."
      }
    }
  ]
};

export default function CateringPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CateringClient />
    </>
  );
}
