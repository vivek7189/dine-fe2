import DhabasClient from './DhabasClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Dhabas India | Highway & Roadside Restaurants | DineOpen',
  description: 'Best POS for dhabas, highway restaurants & roadside eateries in India. Quick billing, driver loyalty, 24-hour operations, offline mode, GST compliance. From $20/month (₹299 in India).',
  keywords: 'dhaba POS India, highway restaurant software, roadside dhaba billing, truck driver loyalty, 24 hour restaurant POS, offline billing software',
  openGraph: {
    title: 'POS Software for Dhabas India | Highway Restaurant | DineOpen',
    description: 'Best POS for dhabas with quick billing, driver loyalty, and 24-hour operation support.',
    url: 'https://www.dineopen.com/for/dhabas',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/dhabas' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for dhabas and highway restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for dhabas and highway restaurants, offering quick billing, offline mode for remote locations, driver loyalty programs, and 24-hour operation support."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen work offline for dhabas in remote areas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen works fully offline for dhabas in areas with poor internet connectivity. All billing data syncs automatically when the connection is restored."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage 24-hour dhaba operations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports 24-hour operations with shift management, staff handover reports, and continuous billing. Perfect for highway dhabas that never close."
      }
    },
    {
      "@type": "Question",
      "name": "How much does dhaba POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. It runs on your existing smartphone, so no expensive hardware is needed for your dhaba."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for dhabas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial perfect for dhabas getting started with digital billing. Upgrade anytime to access loyalty programs and multi-location features."
      }
    }
  ]
};

export default function DhabasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <DhabasClient />
    </>
  );
}
