import PricingClient from './PricingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen Pricing | Restaurant POS from $9.99/month | Free Trial',
  description: 'DineOpen pricing plans starting at $9.99/month (₹300/month in India). AI voice ordering, QR menus, zero transaction fees. Compare Spark vs Blaze plans. Free 30-day trial.',
  keywords: 'DineOpen pricing, restaurant POS pricing, cheap restaurant POS, affordable restaurant software, restaurant billing software price, POS system cost, restaurant management software pricing, DineOpen cost, free restaurant POS trial',
  openGraph: {
    title: 'DineOpen Pricing | Restaurant POS from $9.99/month',
    description: 'Affordable restaurant POS pricing. AI features, zero transaction fees. Free 30-day trial.',
    url: 'https://www.dineopen.com/pricing',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen Pricing | Restaurant POS from $9.99/month',
    description: 'Affordable restaurant POS with AI. Zero transaction fees. Free 30-day trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pricing',
  },
};

export default function PricingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DineOpen Restaurant POS",
    "description": "AI-powered restaurant POS and billing software with voice ordering, QR menus, and zero transaction fees.",
    "brand": { "@type": "Brand", "name": "DineOpen" },
    "offers": [
      {
        "@type": "Offer",
        "name": "Spark Plan",
        "price": "9.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Blaze Plan",
        "price": "89",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Spark Plan (India)",
        "price": "300",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does DineOpen cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Spark plan starts at $9.99/month internationally or ₹300/month in India for up to 3 locations. The Blaze plan at $89/month supports unlimited locations with centralized management. All plans include a 30-day free trial with no credit card required."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free trial for DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial with no credit card required. You get full access to all features including AI Agent, Cloud POS, inventory management, analytics, and loyalty programs. No feature restrictions during the trial."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen charge transaction fees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen charges zero transaction fees on all plans. You only pay the monthly subscription. Standard payment gateway processing fees from Razorpay or Dodo Payments apply as normal, but DineOpen adds no additional per-transaction charges."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between Spark and Blaze plans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Spark ($9.99/month) includes all features for up to 3 locations: AI Agent, Cloud POS, waiter app, inventory, analytics, KDS, and loyalty. Blaze ($89/month) adds unlimited locations, centralized dashboard, cross-location analytics, and centralized menu management for restaurant chains and franchises."
        }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen pricing compare to competitors?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is significantly more affordable than competitors. Toast charges $69/month + 2.49% per transaction. Square charges $60/month + 2.6% per transaction. LightSpeed costs $89/month. TouchBistro is $69/month. DineOpen starts at $9.99/month with zero transaction fees and includes AI features that competitors charge extra for."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my DineOpen subscription anytime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen subscriptions can be cancelled anytime. There are no long-term contracts or cancellation fees. You can also switch between Spark and Blaze plans as your restaurant grows."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PricingClient />
    </>
  );
}
