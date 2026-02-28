import ZomatoBaseAlternativeClient from './ZomatoBaseAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Zomato Base Alternative 2026 | DineOpen - AI POS, Lower Fees',
  description: 'Looking for a Zomato Base alternative? DineOpen offers AI voice ordering, zero transaction fees, multi-location support. Not locked to Zomato ecosystem. Free 30-day trial.',
  keywords: 'Zomato Base alternative, Zomato Base competitor, better than Zomato Base, Zomato POS alternative, restaurant POS India, Zomato billing software alternative',
  openGraph: {
    title: 'Best Zomato Base Alternative | DineOpen - AI-Powered POS',
    description: 'Switch from Zomato Base to DineOpen. AI voice ordering, zero fees, multi-platform support.',
    url: 'https://www.dineopen.com/alternatives/zomato-base',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/zomato-base',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than Zomato Base?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is an independent platform where you own your data. Unlike Zomato Base, you are not locked into the Zomato ecosystem, and you get AI voice ordering and multi-platform support."
      }
    },
    {
      "@type": "Question",
      "name": "Is DineOpen free like Zomato Base?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at ₹300/month with a 30-day free trial. Unlike Zomato Base, you get an independent platform with no ecosystem lock-in, AI features, and full data ownership."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen integrate with Zomato?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers direct Zomato order integration without locking you into the Zomato ecosystem. You can also integrate with Swiggy and other platforms simultaneously."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use DineOpen instead of Zomato Base?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen gives you Zomato integration plus platform independence, AI voice ordering, and multi-platform support including Swiggy — all while you retain full ownership of your data."
      }
    },
    {
      "@type": "Question",
      "name": "What features does DineOpen have that Zomato Base doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers AI voice ordering, independent data ownership, Swiggy integration, loyalty programs, and multi-location support — features not available in Zomato Base."
      }
    }
  ]
};

export default function ZomatoBaseAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ZomatoBaseAlternativeClient />
    </>
  );
}
