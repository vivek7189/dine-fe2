import ChaiTapriClient from './ChaiTapriClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Chai Tapri | Tea Stall Billing | DineOpen',
  description: 'Best POS software for chai tapri and tea stalls. Quick billing, cutting chai tracking, biscuit combos. Perfect for chai cafes, tea lounges, and traditional chai stalls.',
  keywords: 'chai tapri POS, tea stall billing software, chai cafe software, cutting chai billing, tea shop POS, chai lounge software, kadak chai billing',
  openGraph: {
    title: 'POS Software for Chai Tapri | DineOpen',
    description: 'Specialized POS for chai tapris with quick billing and inventory tracking.',
    url: 'https://www.dineopen.com/for/chai-tapri',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/chai-tapri',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for chai tapri and tea stalls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for chai tapris and tea stalls, offering quick billing, cutting chai tracking, combo management for biscuits and snacks, and simple mobile-based operation."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle quick billing for chai stalls during rush hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is optimized for speed with one-tap billing for popular items like cutting chai. It handles high-volume rush hours efficiently from your smartphone."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen work on a phone for chai tapri billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen works on any smartphone with a simple interface perfect for chai tapris. No expensive POS hardware needed, just your phone and an internet connection."
      }
    },
    {
      "@type": "Question",
      "name": "How much does chai tapri POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan ideal for small chai stalls. It is the most affordable POS solution for tea businesses in India."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free plan for chai tapris?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan perfect for small chai tapris. You can start billing digitally with zero investment and upgrade as your business grows."
      }
    }
  ]
};

export default function ChaiTapriPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ChaiTapriClient />
    </>
  );
}
