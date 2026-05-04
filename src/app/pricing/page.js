import PricingClient from './PricingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen Pricing | AI Restaurant POS from $10/month | Free Trial',
  description: 'The world\'s most affordable AI-powered restaurant POS. Plans start at $10/month ($8 annual) with AI voice ordering, KOT printing, QR menus and zero transaction fees. Free 14-day trial.',
  keywords: 'DineOpen pricing, restaurant POS pricing, cheap restaurant POS, AI restaurant POS, affordable restaurant software, restaurant billing software price, POS system cost, Petpooja alternative, Toast alternative, Square alternative, free restaurant POS trial',
  openGraph: {
    title: 'DineOpen Pricing | AI Restaurant POS from $10/month',
    description: 'The world\'s most affordable AI-powered restaurant POS. Starting at $10/month. Zero transaction fees. Free 14-day trial.',
    url: 'https://www.dineopen.com/pricing',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen Pricing | AI Restaurant POS from $10/month',
    description: 'The world\'s most affordable AI-powered POS. Starting at $10/month. Zero transaction fees. Free 14-day trial.',
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
    "description": "AI-powered restaurant POS and billing software with voice ordering, QR menus, KOT printing, and zero transaction fees. Starting at just ₹299/month.",
    "image": "https://www.dineopen.com/favicon.png",
    "brand": { "@type": "Brand", "name": "DineOpen" },
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter Plan (India)",
        "price": "299",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Growth Plan (India)",
        "price": "899",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan (India)",
        "price": "1799",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "10",
        "priceCurrency": "USD",
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
          "text": "DineOpen Starter plan starts at just ₹299/month for a single outlet ($10/month internationally). Growth plan is ₹899/month with AI features for 1 outlet. Pro plan is ₹1,799/month for up to 2 outlets with chain dashboard. Enterprise pricing is custom for 3+ outlets - book a demo. All plans include a 14-day free trial with no credit card required."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free trial for DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 14-day free trial with no credit card required. You get full access to all features including AI Voice Ordering, Cloud POS, KOT printing, inventory management, analytics, and customer loyalty. No feature restrictions during the trial."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen charge transaction fees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen charges zero transaction fees on all plans. You only pay your monthly subscription. Standard payment gateway processing fees from Razorpay or Paytm apply as normal, but DineOpen adds no additional per-transaction charges. UPI payments via our recommended Paytm integration are 0% fees."
        }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen pricing compare to Petpooja?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Petpooja's headline price of ₹833/month (₹10,000/year) is misleading because most restaurants need to pay extra for the KOT printer module, captain app, inventory module, and online ordering integration - bringing the real cost to ₹1,800-3,500/month. DineOpen Growth plan at ₹899/month includes ALL of these features plus AI Voice Ordering, AI Menu Generator, and AI Insights that Petpooja doesn't offer at any price."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between Starter, Growth and Pro plans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Starter (₹299/month) is for a single outlet with core POS, KOT printing and QR ordering. Growth (₹899/month) adds AI Voice Ordering, AI Menu Generator, captain app, KDS, advanced inventory, and customer loyalty for 1 outlet. Pro (₹1,799/month) adds chain dashboard, cross-outlet analytics, centralized management, and supports up to 2 outlets. Enterprise is custom pricing for 3+ outlets with unlimited scale - book a demo."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my DineOpen subscription anytime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen subscriptions can be cancelled anytime. There are no long-term contracts or cancellation fees. You can also switch between Starter, Growth and Pro plans as your restaurant grows. Annual plans save you ~17% compared to monthly billing."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need special hardware for DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No proprietary hardware required. DineOpen runs on any Android tablet/phone or any computer with a web browser. We support all major thermal printers (Bluetooth, USB, network) from any brand. Use whatever printer you already own - no hardware lock-in."
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
