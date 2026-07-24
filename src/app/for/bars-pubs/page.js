import BarsPubsClient from './BarsPubsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Bars & Pubs India | DineOpen',
  description: 'Best POS software for bars, pubs, and lounges in India. Tab management, happy hour pricing, inventory tracking, age verification support.',
  keywords: 'bar POS India, pub billing software, lounge management system, nightclub POS, bar inventory software India',
  openGraph: {
    title: 'POS Software for Bars & Pubs India | DineOpen',
    description: 'Best POS software for bars and pubs in India with tab management and happy hour pricing.',
    url: 'https://www.dineopen.com/for/bars-pubs',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/bars-pubs',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS software for bars and pubs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for bars and pubs, offering tab management, happy hour pricing, split billing, and liquor inventory tracking tailored for nightlife businesses."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support bar tab management?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen lets you open tabs for customers, add orders throughout the night, and close tabs with split bill options. It simplifies bar operations during peak hours."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle liquor inventory tracking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides detailed inventory tracking for liquor, beer, and mixers with pour tracking, low stock alerts, and wastage reporting to minimize losses."
      }
    },
    {
      "@type": "Question",
      "name": "How much does bar POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. It includes features like happy hour pricing and tab management at no extra cost."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for bars?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial so you can try core POS features for your bar. Upgrade anytime to access advanced features like multi-location management."
      }
    }
  ]
};

export default function BarsPubsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BarsPubsClient />
    </>
  );
}
