import MithaiShopsClient from './MithaiShopsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Mithai Shops | Indian Sweets Billing | DineOpen',
  description: 'Best POS software for mithai shops and Indian sweet stores. Weight-based billing, festival rush handling, box/gift packing. Perfect for halwai shops, Bengali sweets, and South Indian sweets.',
  keywords: 'mithai shop POS, Indian sweets billing software, halwai shop software, sweet shop POS, Bengali sweets billing, ladoo shop software, barfi billing software',
  openGraph: {
    title: 'POS Software for Mithai Shops | DineOpen',
    description: 'Specialized POS for mithai shops with weight-based billing and festival rush management.',
    url: 'https://www.dineopen.com/for/mithai-shops',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/mithai-shops',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for mithai shops and Indian sweet stores?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for mithai shops, offering weight-based billing, festival rush management, box and gift packing options, and GST-compliant invoicing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support weight-based billing for sweets?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports weight-based billing where you can price items per kg or per piece. It integrates with weighing scales for accurate and fast billing."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle festival rush at mithai shops?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is built to handle high-volume festival rush during Diwali, Raksha Bandhan, and other occasions with fast billing, pre-packed box options, and queue management."
      }
    },
    {
      "@type": "Question",
      "name": "How much does mithai shop POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Weight-based billing and box packing features are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for mithai shops?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to explore core billing features. Upgrade to access weight-based billing, gift box management, and multi-location support."
      }
    }
  ]
};

export default function MithaiShopsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MithaiShopsClient />
    </>
  );
}
