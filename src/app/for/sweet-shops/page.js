import SweetShopsClient from './SweetShopsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Sweet Shops & Mithai Stores India | DineOpen',
  description: 'Best POS for sweet shops, mithai stores, namkeen shops & halwai in India. Weight-based billing, festival rush management, box packaging, GST invoicing. ₹999/month.',
  keywords: 'sweet shop POS India, mithai shop billing software, halwai POS system, namkeen shop software, Indian sweets billing, weight based billing POS',
  openGraph: {
    title: 'POS Software for Sweet Shops & Mithai Stores India | DineOpen',
    description: 'Best POS for sweet shops with weight-based billing, festival rush management, and GST invoicing.',
    url: 'https://www.dineopen.com/for/sweet-shops',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/sweet-shops' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for sweet shops in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for sweet shops and halwai stores, offering weight-based billing, festival rush management, box packaging options, namkeen billing, and GST invoicing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support weight-based billing for sweets and namkeen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports per-kg weight-based billing for sweets and namkeen with weighing scale integration. It calculates prices automatically based on weight entered."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle gift box packaging billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports box and gift packaging with different box sizes, mixed assortment billing, and gift wrapping charges. Perfect for festive sweet box orders."
      }
    },
    {
      "@type": "Question",
      "name": "How much does sweet shop POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Weight-based billing and box packaging features are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for sweet shops?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to try core billing features for your sweet shop. Upgrade to access weight-based billing and festival rush management tools."
      }
    }
  ]
};

export default function SweetShopsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SweetShopsClient />
    </>
  );
}
