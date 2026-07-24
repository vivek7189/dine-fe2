import QSRClient from './QSRClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for QSR & Fast Food | Quick Service Restaurants | DineOpen',
  description: 'Best POS for QSR and fast food restaurants. Speed-optimized billing, combo meals, self-ordering kiosks, drive-thru support. Handle high-volume orders efficiently.',
  keywords: 'QSR POS, quick service restaurant software, fast food POS, self ordering kiosk, drive thru POS, fast casual POS, burger shop software, QSR billing India',
  openGraph: {
    title: 'POS Software for QSR & Fast Food | DineOpen',
    description: 'Speed-optimized POS for quick service restaurants with combo meals, self-ordering, and high-volume billing.',
    url: 'https://www.dineopen.com/for/qsr',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/qsr',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for QSR and fast food restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for QSR and fast food restaurants, offering speed-optimized billing, combo meal management, self-ordering kiosk support, and high-volume order handling."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support self-ordering kiosks for QSR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports self-ordering kiosks that let customers place orders directly, reducing queues and speeding up service during peak hours."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle combo meals and meal deals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen makes it easy to create and manage combo meals, meal deals, and upselling prompts. Staff can quickly apply combos during billing to speed up service."
      }
    },
    {
      "@type": "Question",
      "name": "How much does QSR POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. All QSR-specific features like combo management and fast billing are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for fast food restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial so you can test core POS features for your QSR. Upgrade anytime to unlock advanced features like kiosk support and analytics."
      }
    }
  ]
};

export default function QSRPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <QSRClient />
    </>
  );
}
