import BakeriesClient from './BakeriesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Bakeries India | DineOpen',
  description: 'Best POS software for bakeries and sweet shops in India. Order management, GST billing, inventory tracking, custom cake orders, loyalty programs.',
  keywords: 'bakery POS India, sweet shop billing software, bakery management system, confectionery POS, mithai shop software India',
  openGraph: {
    title: 'POS Software for Bakeries India | DineOpen',
    description: 'Best POS software for bakeries and sweet shops in India with order management and GST billing.',
    url: 'https://www.dineopen.com/for/bakeries',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/bakeries',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS software for bakeries in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for bakeries, offering order management, GST billing, inventory tracking for perishable ingredients, custom cake order handling, and loyalty programs."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle custom cake orders and advance bookings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports custom cake orders with advance booking, special instructions, and deposit tracking. You can manage all custom orders from a single dashboard."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen track bakery inventory and expiry dates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen tracks ingredient inventory with low stock alerts and helps manage perishable items. This reduces waste and ensures you never run out of key ingredients."
      }
    },
    {
      "@type": "Question",
      "name": "How much does bakery POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial for small bakeries. All bakery-specific features like custom orders and inventory tracking are included."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for bakeries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial so you can try the POS system for your bakery. Upgrade anytime to access advanced inventory and multi-location features."
      }
    }
  ]
};

export default function BakeriesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BakeriesClient />
    </>
  );
}
