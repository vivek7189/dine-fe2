import SquareAlternativeClient from './SquareAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Square POS Alternative 2026 | DineOpen - Save 80% on Fees',
  description: 'Looking for a Square alternative? DineOpen offers AI voice ordering, QR menus, zero transaction fees vs Square\'s 2.6%. Save $5,000+/year. Free 30-day trial. Perfect for restaurants, cafes & bars.',
  keywords: 'Square alternative, Square POS alternative, better than Square, Square competitor, Square replacement, affordable POS system, restaurant POS without fees, AI restaurant POS, Square for restaurants alternative, cheap Square alternative',
  openGraph: {
    title: 'Best Square POS Alternative | DineOpen - AI-Powered, Zero Fees',
    description: 'Switch from Square to DineOpen. Get AI voice ordering, zero transaction fees, and save thousands yearly. Free 30-day trial.',
    url: 'https://www.dineopen.com/alternatives/square',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-square-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best Square POS Alternative',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Square POS Alternative | DineOpen - Save 80% on Fees',
    description: 'Switch from Square to DineOpen. AI voice ordering, zero transaction fees. Free 30-day trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/square',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than Square for restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is purpose-built for restaurants with AI voice ordering and zero transaction fees, compared to Square's 2.6% + $0.10 per transaction. DineOpen includes restaurant-specific features that Square charges extra for."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs $9.99/month compared to Square's $60/month for restaurants. DineOpen also charges zero transaction fees versus Square's 2.6% + $0.10, saving restaurants thousands per year."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have a free plan like Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers a 30-day free trial with all features included. The Spark plan at $9.99/month includes AI voice ordering and features that Square charges extra for on top of their transaction fees."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Square to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching from Square to DineOpen is easy with our migration process. Start a free 30-day trial to test all features before fully switching."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support payment processing like Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports cards, UPI, and PayPal via Dodo Payments and Razorpay. Unlike Square, DineOpen charges zero transaction fees on its end."
      }
    }
  ]
};

export default function SquareAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SquareAlternativeClient />
    </>
  );
}
