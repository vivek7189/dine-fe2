import RewardsClient from './RewardsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Loyalty Rewards Program | Points & Redemption | DineOpen',
  description: 'Points-based loyalty rewards program for restaurants. Customers earn points on every order and redeem for discounts or free items. Tiered rewards, automatic tracking, zero transaction fees. Included with DineOpen.',
  keywords: 'restaurant loyalty rewards, points program restaurant, loyalty points system, reward redemption, restaurant rewards app, customer rewards program, loyalty tiers restaurant, repeat customer rewards',
  openGraph: {
    title: 'Restaurant Loyalty Rewards Program | Points & Redemption | DineOpen',
    description: 'Points-based rewards that drive repeat visits. Earn, track, and redeem automatically.',
    url: 'https://www.dineopen.com/products/loyalty/rewards',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Loyalty Rewards Program | DineOpen',
    description: 'Points, tiers, and automatic redemption. Increase repeat visits by 40%.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty/rewards',
  },
};

export default function RewardsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Loyalty Rewards",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Loyalty Rewards Software",
    "description": "Points-based loyalty rewards program for restaurants with automatic tracking, tiered rewards, and easy redemption.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/loyalty/rewards",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Included with Spark Plan" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Included with Spark Plan India" }
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do customers earn loyalty points?",
        "acceptedAnswer": { "@type": "Answer", "text": "Customers earn points automatically on every order placed through DineOpen POS, QR menu, or the Crave app. You define the earning rate, for example 1 point per dollar or per rupee spent. No cards or manual stamps needed." }
      },
      {
        "@type": "Question",
        "name": "How do customers redeem their rewards?",
        "acceptedAnswer": { "@type": "Answer", "text": "When a customer has enough points, they can redeem at the POS by providing their phone number, or through the Crave app. The discount is applied automatically to their bill." }
      },
      {
        "@type": "Question",
        "name": "Can I create different reward tiers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen supports tiered loyalty programs like Silver, Gold, and Platinum. Each tier can have different earning rates, exclusive rewards, and special perks. Customers automatically move between tiers based on their spending." }
      },
      {
        "@type": "Question",
        "name": "Are there transaction fees on the loyalty program?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. DineOpen charges zero transaction fees on loyalty rewards. Unlike some platforms that take a cut of every redemption, DineOpen includes the full loyalty program in your subscription at no extra cost." }
      }
    ]
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "DineOpen Loyalty", "item": "https://www.dineopen.com/products/loyalty" },
      { "@type": "ListItem", "position": 4, "name": "Rewards", "item": "https://www.dineopen.com/products/loyalty/rewards" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <RewardsClient />
    </>
  );
}
