import HotelsClient from './HotelsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'F&B POS Software for Hotels India | DineOpen',
  description: 'Best restaurant and F&B POS software for hotels in India. Room service, multi-outlet management, room billing integration, banquet management.',
  keywords: 'hotel restaurant POS India, F&B management hotel, room service software, hotel dining POS, banquet billing software India',
  openGraph: {
    title: 'F&B POS Software for Hotels India | DineOpen',
    description: 'Best F&B POS software for hotels in India with room service and multi-outlet management.',
    url: 'https://www.dineopen.com/for/hotels',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/hotels',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best F&B POS for hotels in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best F&B POS for hotels, offering room service management, multi-outlet billing, room charge integration, and banquet management for hotel restaurants."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support room service and room charge billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports room service ordering and can post F&B charges directly to guest room bills. This creates a seamless experience for hotel guests."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage multiple restaurant outlets in a hotel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-outlet management with separate menus, staff, and reporting for each restaurant, bar, or cafe within your hotel property."
      }
    },
    {
      "@type": "Question",
      "name": "How much does hotel F&B POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month per outlet with a free Starter plan available. Room service and multi-outlet features are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for hotels?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to explore core POS features. Upgrade to access room charge integration, banquet management, and multi-outlet support."
      }
    }
  ]
};

export default function HotelsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HotelsClient />
    </>
  );
}
