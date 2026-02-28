import JuiceBarsClient from './JuiceBarsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Juice Bars & Smoothie Shops India | DineOpen',
  description: 'Best POS for juice bars, smoothie shops & fresh juice corners in India. Quick billing, customization handling, inventory for perishables, loyalty programs. ₹999/month.',
  keywords: 'juice bar POS India, smoothie shop software, fresh juice billing, juice corner POS, fruit juice shop software, healthy drinks billing',
  openGraph: {
    title: 'POS Software for Juice Bars & Smoothie Shops India | DineOpen',
    description: 'Best POS for juice bars with quick billing, customization handling, and loyalty programs.',
    url: 'https://www.dineopen.com/for/juice-bars',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/juice-bars' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for juice bars and smoothie shops?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for juice bars and smoothie shops, offering quick billing, customization handling for add-ons and sizes, perishable inventory tracking, and loyalty programs."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle juice customizations like add-ons and sizes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports unlimited customizations including juice sizes, add-ons like protein powder or chia seeds, sugar levels, and ice preferences for every order."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen track perishable inventory for juice bars?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen tracks fresh fruit and perishable ingredient inventory with low stock alerts. This helps reduce waste and ensures you always have fresh ingredients available."
      }
    },
    {
      "@type": "Question",
      "name": "How much does juice bar POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Customization handling and inventory tracking are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for juice bars?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to try core POS features for your juice bar. Upgrade anytime to access inventory management and loyalty programs."
      }
    }
  ]
};

export default function JuiceBarsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <JuiceBarsClient />
    </>
  );
}
