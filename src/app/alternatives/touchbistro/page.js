import TouchBistroAlternativeClient from './TouchBistroAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best TouchBistro Alternative 2026 | DineOpen - Save 75% on Costs',
  description: 'Looking for a TouchBistro alternative? DineOpen offers AI voice ordering, cloud-based flexibility, no iPad requirement. Save $2,500+/year vs TouchBistro. Free 7-day trial.',
  keywords: 'TouchBistro alternative, TouchBistro POS alternative, better than TouchBistro, TouchBistro competitor, affordable restaurant POS, TouchBistro replacement, cloud POS alternative',
  openGraph: {
    title: 'Best TouchBistro Alternative | DineOpen - Cloud-Based & AI-Powered',
    description: 'Switch from TouchBistro to DineOpen. Cloud-based, AI voice ordering, works on any device. Free 7-day trial.',
    url: 'https://www.dineopen.com/alternatives/touchbistro',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best TouchBistro Alternative | DineOpen - Save 75%',
    description: 'Switch from TouchBistro to DineOpen. Cloud-based, AI voice ordering. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/touchbistro',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than TouchBistro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs $20/month versus TouchBistro's $69/month, works on any device (not just iPad), and includes AI voice ordering and zero transaction fees."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen work on iPad like TouchBistro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen works on any device — iPad, Android tablets, laptops, and phones. Unlike TouchBistro, you are not limited to iPad-only operation."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs TouchBistro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs $20/month compared to TouchBistro's $69/month. Restaurants save $580+ per year by switching to DineOpen."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from TouchBistro to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching is straightforward. Start a free 7-day trial to test all of DineOpen's features before migrating from TouchBistro."
      }
    },
    {
      "@type": "Question",
      "name": "What does DineOpen have that TouchBistro doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers AI voice ordering, works on any device (not iPad-only), charges zero transaction fees, and includes built-in delivery integration — features TouchBistro lacks."
      }
    }
  ]
};

export default function TouchBistroAlternativePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "TouchBistro Alternative - DineOpen",
    "description": "Compare DineOpen vs TouchBistro POS. See features, pricing, and why restaurants switch.",
    "url": "https://www.dineopen.com/alternatives/touchbistro"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TouchBistroAlternativeClient />
    </>
  );
}
