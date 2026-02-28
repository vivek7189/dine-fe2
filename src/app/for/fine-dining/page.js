import FineDiningClient from './FineDiningClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Fine Dining Restaurants | Premium Service | DineOpen',
  description: 'Elegant POS solution for fine dining restaurants. Course-based ordering, wine pairing, guest preferences, split billing, tableside service. Enhance your premium dining experience.',
  keywords: 'fine dining POS, luxury restaurant software, premium restaurant POS, course management system, wine pairing POS, upscale restaurant software, tableside ordering fine dining',
  openGraph: {
    title: 'POS Software for Fine Dining Restaurants | DineOpen',
    description: 'Premium POS for fine dining with course management, wine pairing, and elegant tableside service.',
    url: 'https://www.dineopen.com/for/fine-dining',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/fine-dining',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for fine dining restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for fine dining restaurants, offering course-based ordering, wine pairing suggestions, guest preference tracking, and elegant tableside service capabilities."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support course-based ordering?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-course meal management, allowing your kitchen to pace dishes perfectly. Staff can fire courses at the right time for a premium dining experience."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen track guest preferences for fine dining?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen stores guest preferences, dietary restrictions, and visit history so you can deliver personalized service that keeps premium diners coming back."
      }
    },
    {
      "@type": "Question",
      "name": "How much does fine dining POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with premium features included. A free Starter plan is available to explore the platform before committing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for fine dining?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan that lets you try core features. Upgrade to access course management, wine pairing, and guest preference tracking."
      }
    }
  ]
};

export default function FineDiningPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FineDiningClient />
    </>
  );
}
