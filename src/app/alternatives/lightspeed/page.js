import LightspeedAlternativeClient from './LightspeedAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Lightspeed Restaurant Alternative 2026 | DineOpen - Save 70%',
  description: 'Looking for a Lightspeed Restaurant alternative? DineOpen offers AI voice ordering, lower monthly fees, unlimited locations. Save $3,000+/year vs Lightspeed. Free 7-day trial.',
  keywords: 'Lightspeed alternative, Lightspeed Restaurant alternative, Lightspeed POS alternative, better than Lightspeed, Lightspeed competitor, affordable restaurant POS, Lightspeed replacement',
  openGraph: {
    title: 'Best Lightspeed Restaurant Alternative | DineOpen - AI-Powered',
    description: 'Switch from Lightspeed to DineOpen. Get AI voice ordering, lower fees, unlimited locations. Free 7-day trial.',
    url: 'https://www.dineopen.com/alternatives/lightspeed',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Lightspeed Alternative | DineOpen - Save 70%',
    description: 'Switch from Lightspeed to DineOpen. AI voice ordering, lower fees. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/lightspeed',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than LightSpeed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs just $9.99/month compared to LightSpeed's $89/month and includes AI voice ordering, AI chat assistant, and menu extraction — features LightSpeed does not offer."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs LightSpeed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Restaurants save $950+ per year with DineOpen at $9.99/month versus LightSpeed's $89/month. DineOpen includes more AI features at a fraction of the cost."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have inventory management like LightSpeed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen includes real-time inventory tracking, automatic low-stock alerts, and recipe-level costing — comparable to LightSpeed's inventory features at a much lower price."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from LightSpeed to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching is easy. Start a free 7-day trial to test all of DineOpen's features before fully migrating from LightSpeed."
      }
    },
    {
      "@type": "Question",
      "name": "What AI features does DineOpen have vs LightSpeed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers AI voice ordering for phone orders, an AI chat assistant for staff, and AI-powered menu extraction from images — none of which are available in LightSpeed."
      }
    }
  ]
};

export default function LightspeedAlternativePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Lightspeed Restaurant Alternative - DineOpen",
    "description": "Compare DineOpen vs Lightspeed Restaurant POS. See features, pricing, and why restaurants switch.",
    "url": "https://www.dineopen.com/alternatives/lightspeed",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "DineOpen",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "USD"
      }
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LightspeedAlternativeClient />
    </>
  );
}
