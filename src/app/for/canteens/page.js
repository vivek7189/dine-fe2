import CanteensClient from './CanteensClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Canteens India | Corporate, School, Factory | DineOpen',
  description: 'Best POS for canteens - corporate offices, schools, colleges, factories. Meal subscriptions, prepaid cards, subsidized billing, attendance integration. From $20/month (₹299 in India).',
  keywords: 'canteen POS India, corporate canteen software, school canteen billing, factory mess software, cafeteria management system, subsidized meal billing',
  openGraph: {
    title: 'POS Software for Canteens India | Corporate & School | DineOpen',
    description: 'Best POS for canteens with meal subscriptions, prepaid cards, and subsidized billing.',
    url: 'https://www.dineopen.com/for/canteens',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/canteens' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for corporate and school canteens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for canteens, offering meal subscriptions, prepaid card support, subsidized billing, and fast checkout designed for corporate offices, schools, and factories."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support prepaid cards and wallet systems for canteens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports prepaid card billing and digital wallet systems. Employees or students can load balance and pay quickly, reducing cash handling and speeding up queues."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle subsidized meal billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports subsidized pricing where the employer or institution covers part of the meal cost. You can configure different subsidy levels for different meal types."
      }
    },
    {
      "@type": "Question",
      "name": "How much does canteen POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Canteen-specific features like subscriptions and prepaid billing are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for canteens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to try core features for your canteen. Upgrade anytime to access meal subscriptions and prepaid card management."
      }
    }
  ]
};

export default function CanteensPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CanteensClient />
    </>
  );
}
