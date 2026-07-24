import CollegeCanteensClient from './CollegeCanteensClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for College Canteens | Student Billing | DineOpen',
  description: 'Best billing software for college and university canteens. Student ID integration, wallet system, fast billing for rush hours, and analytics.',
  keywords: 'college canteen software, university canteen POS, student canteen billing, campus canteen management, college mess software, student cafeteria POS',
  openGraph: {
    title: 'POS Software for College Canteens | DineOpen',
    description: 'Manage college canteen operations with student ID integration and fast billing.',
    url: 'https://www.dineopen.com/for/college-canteens',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/college-canteens' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for college and university canteens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for college canteens, offering student ID integration, wallet-based payments, fast billing for rush hours, and detailed sales analytics."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support student ID and wallet payments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen integrates with student ID systems and supports digital wallet payments. Students can pay quickly with their ID cards, reducing queue times between classes."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle rush hour billing in college canteens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is built for speed with quick-select menus and one-tap billing. It handles the lunch rush efficiently when hundreds of students need to be served quickly."
      }
    },
    {
      "@type": "Question",
      "name": "How much does college canteen POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Student wallet and ID integration features are included in paid plans at no extra cost."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for college canteens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to try core billing features. Upgrade to access student wallet integration, analytics, and multi-counter support."
      }
    }
  ]
};

export default function CollegeCanteensPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CollegeCanteensClient />
    </>
  );
}
