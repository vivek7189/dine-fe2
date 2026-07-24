import PubsBreweriesClient from './PubsBreweriesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Pubs & Microbreweries India | Bar Management | DineOpen',
  description: 'Best POS for pubs, microbreweries, bars & taprooms in India. Tab management, happy hour pricing, age verification, keg tracking, liquor inventory. From $20/month (₹299 in India).',
  keywords: 'pub POS India, microbrewery software, bar billing system, taproom POS, liquor inventory management, happy hour pricing software',
  openGraph: {
    title: 'POS Software for Pubs & Microbreweries India | DineOpen',
    description: 'Best POS for pubs and breweries with tab management, happy hour pricing, and keg tracking.',
    url: 'https://www.dineopen.com/for/pubs-breweries',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/pubs-breweries' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for pubs and microbreweries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for pubs and microbreweries, offering tab management, happy hour pricing, keg tracking, liquor inventory management, and age verification support."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support keg tracking for microbreweries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen tracks keg levels, pour counts, and batch information for craft beer. You get real-time visibility into remaining stock and can set low-level alerts."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage happy hour pricing automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports automatic happy hour pricing with scheduled time slots. Prices adjust automatically during happy hours and revert back when the period ends."
      }
    },
    {
      "@type": "Question",
      "name": "How much does pub and brewery POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Tab management, happy hour pricing, and keg tracking are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for pubs and breweries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to explore core features. Upgrade to access keg tracking, happy hour automation, and detailed beverage analytics."
      }
    }
  ]
};

export default function PubsBreweriesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PubsBreweriesClient />
    </>
  );
}
