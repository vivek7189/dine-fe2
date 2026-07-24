import FoodTrucksClient from './FoodTrucksClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Food Trucks India | DineOpen',
  description: 'Best POS software for food trucks in India. Mobile billing, offline mode, QR ordering, compact interface. Works without stable internet.',
  keywords: 'food truck POS India, mobile food cart billing, street food POS, food stall software, portable restaurant POS India',
  openGraph: {
    title: 'POS Software for Food Trucks India | DineOpen',
    description: 'Best POS software for food trucks in India with mobile billing and offline mode.',
    url: 'https://www.dineopen.com/for/food-trucks',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/food-trucks',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for food trucks in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for food trucks, offering mobile billing, offline mode, QR ordering, and a compact interface that works perfectly on smartphones and tablets."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen work offline for food trucks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen works in offline mode so you can continue billing even without stable internet. All data syncs automatically when connectivity is restored."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use DineOpen on my phone for food truck billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is fully mobile-friendly and works on any smartphone or tablet. No expensive POS hardware is needed, making it ideal for food truck operations."
      }
    },
    {
      "@type": "Question",
      "name": "How much does food truck POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at just $20/month with a 7-day free trial available. No expensive hardware required since it runs on your existing phone or tablet."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for food trucks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial with core billing features. You can start using it immediately on your phone without any upfront investment."
      }
    }
  ]
};

export default function FoodTrucksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FoodTrucksClient />
    </>
  );
}
