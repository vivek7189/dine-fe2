import ReeloAlternativeClient from './ReeloAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Reelo Alternative 2026 | DineOpen - Free Loyalty with POS',
  description: 'Looking for a Reelo alternative? DineOpen includes loyalty, rewards & WhatsApp marketing FREE with POS. Save ₹30,000+/year vs Reelo. AI voice ordering included. Free 30-day trial.',
  keywords: 'Reelo alternative, Reelo competitor, better than Reelo, Reelo vs DineOpen, restaurant loyalty software India, free loyalty program software, WhatsApp marketing restaurant, customer rewards program free, Reelo pricing alternative',
  openGraph: {
    title: 'Best Reelo Alternative | DineOpen - Free Loyalty with POS',
    description: 'Get Reelo features FREE with DineOpen POS. Loyalty, rewards, WhatsApp campaigns. Save ₹30,000+/year.',
    url: 'https://www.dineopen.com/alternatives/reelo',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-reelo-alternative.jpg', width: 1200, height: 630, alt: 'DineOpen vs Reelo Comparison' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Reelo Alternative | DineOpen - Free Loyalty with POS',
    description: 'Get Reelo features FREE. Loyalty, rewards, WhatsApp campaigns. Save ₹30,000+/year.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/reelo',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than Reelo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is a complete POS + loyalty platform, while Reelo is loyalty-only. DineOpen at ₹300/month includes POS, billing, inventory, and all loyalty features in one platform."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have loyalty features like Reelo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen includes loyalty points, birthday rewards, referral programs, and WhatsApp marketing — all built directly into the POS at no extra cost."
      }
    },
    {
      "@type": "Question",
      "name": "How much does DineOpen cost vs Reelo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs ₹300/month for a full POS + loyalty platform. Reelo charges separately for loyalty-only features, making DineOpen a more complete and cost-effective solution."
      }
    },
    {
      "@type": "Question",
      "name": "Can I replace Reelo with DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen includes all of Reelo's loyalty features plus a complete POS system with billing, inventory management, and AI voice ordering in one integrated platform."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support WhatsApp marketing like Reelo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen includes built-in WhatsApp campaigns and automated messages for customer engagement, similar to Reelo but integrated directly with your POS data."
      }
    }
  ]
};

export default function ReeloAlternativePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Reelo Alternative - DineOpen",
    "description": "Compare DineOpen vs Reelo for restaurant loyalty programs. DineOpen includes loyalty FREE with POS.",
    "url": "https://www.dineopen.com/alternatives/reelo",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ReeloAlternativeClient />
    </>
  );
}
