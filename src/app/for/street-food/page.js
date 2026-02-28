import StreetFoodClient from './StreetFoodClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Street Food | Chaat, Vada Pav, Pav Bhaji | DineOpen',
  description: 'Best POS software for street food stalls. Quick billing, variant management, evening rush handling. Perfect for chaat counters, vada pav stalls, pav bhaji centers, and golgappa shops.',
  keywords: 'street food POS, chaat counter billing, vada pav stall software, pav bhaji billing, golgappa shop POS, panipuri billing software, street food stall software',
  openGraph: {
    title: 'POS Software for Street Food | DineOpen',
    description: 'Specialized POS for street food with quick billing and rush hour management.',
    url: 'https://www.dineopen.com/for/street-food',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/street-food',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for street food stalls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for street food stalls, offering quick mobile billing, variant management for chaat and snacks, evening rush handling, and works on any smartphone."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle variant billing for chaat and street food items?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports item variants like plate sizes, spice levels, and add-ons. Perfect for chaat counters, vada pav stalls, and golgappa shops with customizable items."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen work on a phone for street food billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen runs on any smartphone with a simple, fast interface. No expensive hardware needed, making it ideal for street food vendors and stall operators."
      }
    },
    {
      "@type": "Question",
      "name": "How much does street food POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan perfect for street food vendors. It is the most affordable digital billing solution for small food businesses."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free plan for street food vendors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan ideal for street food stalls. Start digital billing with zero investment and upgrade as your business grows."
      }
    }
  ]
};

export default function StreetFoodPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <StreetFoodClient />
    </>
  );
}
