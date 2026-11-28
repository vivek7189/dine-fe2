import SquareAlternativeClient from './SquareAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Square POS Alternative 2026: From $20/month, Your Own Card Processor | DineOpen',
  description: 'Square charges 2.6% + 15¢ per in-person card payment (Plus is $49/month per location). DineOpen is from $20/month, adds nothing to your card payments and runs on your own devices. 7-day free trial.',
  keywords: 'Square alternative, Square POS alternative, better than Square, Square competitor, Square replacement, affordable POS system, restaurant POS without fees, AI restaurant POS, Square for restaurants alternative, cheap Square alternative',
  openGraph: {
    title: 'Square POS Alternative | DineOpen, from $20/month',
    description: 'Square vs DineOpen: card fees, monthly price and features compared. DineOpen adds no fee to your card payments. Free 7-day trial.',
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
    title: 'Square POS Alternative | DineOpen, from $20/month',
    description: 'Switch from Square to DineOpen. AI voice ordering, zero transaction fees. Free 7-day trial.',
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
        "text": "DineOpen is purpose-built for restaurants with AI voice ordering and zero transaction fees, compared to Square's 2.6% + $0.15 per in-person transaction. DineOpen runs on devices you already own and lets you keep the card processor you choose."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month; Square for Restaurants has a free plan and a Plus plan at $49/month per location (Premium $149). DineOpen also charges zero transaction fees versus Square's 2.6% + $0.15 per in-person payment; you choose your own processor and rate."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have a free plan like Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers a 7-day free trial with all features included. The Starter plan is $20/month (POS, KOT printing, QR ordering, basic inventory). AI voice ordering, the kitchen display and the online ordering website are on Growth at $50/month."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Square to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching from Square to DineOpen is easy with our migration process. Start a free 7-day trial to test all features before fully switching."
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
