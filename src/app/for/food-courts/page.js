import FoodCourtsClient from './FoodCourtsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Food Courts & Mall Food Zones India | DineOpen',
  description: 'Best POS for mall food courts, food zones & multi-vendor setups. Centralized billing, token system, split payments, high-speed checkout. From $20/month (₹299 in India).',
  keywords: 'food court POS India, mall food court software, multi-vendor POS, food zone billing, token system POS, centralized food court billing',
  openGraph: {
    title: 'POS Software for Food Courts & Mall Food Zones India | DineOpen',
    description: 'Best POS for food courts with centralized billing, token system, and high-speed checkout.',
    url: 'https://www.dineopen.com/for/food-courts',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/food-courts' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for food courts and mall food zones?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for food courts, offering centralized billing, token-based ordering, multi-vendor management, and high-speed checkout for mall food zones."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support token-based ordering for food courts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports token-based ordering where customers receive a token number and collect their food when ready. This streamlines operations in busy food courts."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage multiple vendors in a food court?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-vendor food court setups with centralized billing, separate vendor dashboards, and automated revenue splitting between vendors."
      }
    },
    {
      "@type": "Question",
      "name": "How much does food court POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month per vendor with a 7-day free trial available. Token system and centralized billing are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for food courts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to test core features. Upgrade to access multi-vendor management, token systems, and centralized analytics."
      }
    }
  ]
};

export default function FoodCourtsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FoodCourtsClient />
    </>
  );
}
