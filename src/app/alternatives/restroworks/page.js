import RestroworksAlternativeClient from './RestroworksAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restroworks Alternative 2026 | DineOpen - Affordable Restaurant POS',
  description: 'Looking for a Restroworks (POSist) alternative? DineOpen offers AI-powered POS with zero transaction fees, no setup costs, and enterprise features at SMB prices. Free 7-day trial.',
  keywords: 'Restroworks alternative, POSist alternative, Restroworks competitor, restaurant POS India, Restroworks pricing, Restroworks replacement, affordable restaurant POS',
  openGraph: {
    title: 'Best Restroworks Alternative | DineOpen - AI-Powered Restaurant POS',
    description: 'Switch from Restroworks to DineOpen. AI voice ordering, zero transaction fees, no enterprise pricing. Free 7-day trial.',
    url: 'https://www.dineopen.com/alternatives/restroworks',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Restroworks Alternative | DineOpen - Affordable Restaurant POS',
    description: 'Switch from Restroworks to DineOpen. AI-powered POS, zero fees, no contracts. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/restroworks',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen a good alternative to Restroworks (POSist)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen offers AI voice ordering, AI chat assistant, and AI menu extraction at just $9.99/month compared to Restroworks' enterprise pricing that starts at $100+/month per location. DineOpen has zero setup fees and instant self-serve onboarding."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen compared to Restroworks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with zero setup fees. Restroworks typically charges $100-300/month per location plus implementation fees of $1,000-5,000. Small restaurants save $2,000-5,000+ per year by switching to DineOpen."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Restroworks to DineOpen easily?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen offers instant self-serve setup — no IT team required. You can upload your menu via photos using AI extraction and start taking orders within minutes. Start with a free 7-day trial before committing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support multi-location restaurants like Restroworks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen's Blaze plan supports unlimited locations with centralized menu management, consolidated reporting, and role-based access — comparable to Restroworks but at a fraction of the cost with transparent per-outlet pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have better AI features than Restroworks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen includes AI voice ordering for phone orders, an AI chat assistant for staff support, and AI-powered menu extraction from images. Restroworks has limited AI capabilities focused mainly on analytics dashboards."
      }
    }
  ]
};

export default function RestroworksAlternativePage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Restroworks Alternative - DineOpen",
    "description": "Compare DineOpen vs Restroworks (POSist) restaurant POS. Features, pricing, and why restaurants switch.",
    "url": "https://www.dineopen.com/alternatives/restroworks",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "DineOpen",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <RestroworksAlternativeClient />
    </>
  );
}
