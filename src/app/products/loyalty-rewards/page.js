import LoyaltyRewardsClient from './LoyaltyRewardsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Loyalty Program Software | Points, Rewards & Redemption | DineOpen',
  description: 'Free restaurant loyalty & rewards program software. Points-based rewards, cashback, visit tracking, WhatsApp campaigns. Reelo alternative with zero fees. Increase repeat customers by 40%. Free trial.',
  keywords: 'restaurant loyalty program, loyalty software restaurant, customer rewards program, restaurant points system, loyalty rewards app, restaurant CRM, customer retention restaurant, repeat customer program, loyalty card software, reward redemption system, Reelo alternative, restaurant marketing software, WhatsApp marketing restaurant, customer engagement restaurant',
  openGraph: {
    title: 'Restaurant Loyalty Program Software | Points & Rewards | DineOpen',
    description: 'Turn first-time visitors into regulars. Points, rewards, WhatsApp campaigns. Increase repeat customers by 40%.',
    url: 'https://www.dineopen.com/products/loyalty-rewards',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-loyalty.jpg', width: 1200, height: 630, alt: 'DineOpen Loyalty & Rewards Program' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Loyalty Program Software | DineOpen',
    description: 'Points, rewards, WhatsApp campaigns. Increase repeat customers by 40%. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty-rewards',
  },
};

export default function LoyaltyRewardsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Loyalty & Rewards Program",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Customer Loyalty Software",
    "description": "Complete restaurant loyalty program with points, rewards, redemption, and WhatsApp marketing. Turn first-time visitors into regular customers.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/loyalty-rewards",
    "offers": [
      { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Included free with DineOpen POS" },
      { "@type": "Offer", "price": "0", "priceCurrency": "INR", "description": "Included free with DineOpen POS" }
    ],
    "featureList": [
      "Points-based loyalty program",
      "Cashback rewards",
      "Visit-based rewards",
      "Reward redemption system",
      "WhatsApp marketing campaigns",
      "SMS & Email campaigns",
      "Customer analytics",
      "Birthday & anniversary rewards",
      "Referral program",
      "Digital loyalty cards"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "320"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a restaurant loyalty program?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A restaurant loyalty program rewards customers for repeat visits with points, cashback, or free items. It increases customer retention by 25-40% and boosts average order value."
        }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen's loyalty program work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers earn points on every purchase. Points can be redeemed for discounts, free items, or cashback. DineOpen automatically tracks visits and sends personalized offers via WhatsApp."
        }
      },
      {
        "@type": "Question",
        "name": "Is DineOpen's loyalty program free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen's loyalty and rewards program is included free with all POS plans. Unlike standalone loyalty apps like Reelo that charge separately, DineOpen includes it at no extra cost."
        }
      },
      {
        "@type": "Question",
        "name": "How is DineOpen different from Reelo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen includes loyalty features FREE with POS, while Reelo charges ₹2,500+/month separately. DineOpen also has AI voice ordering, QR menus, and billing - all in one platform."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <LoyaltyRewardsClient />
    </>
  );
}
