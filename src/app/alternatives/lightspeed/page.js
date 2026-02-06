import LightspeedAlternativeClient from './LightspeedAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Lightspeed Restaurant Alternative 2026 | DineOpen - Save 70%',
  description: 'Looking for a Lightspeed Restaurant alternative? DineOpen offers AI voice ordering, lower monthly fees, unlimited locations. Save $3,000+/year vs Lightspeed. Free 30-day trial.',
  keywords: 'Lightspeed alternative, Lightspeed Restaurant alternative, Lightspeed POS alternative, better than Lightspeed, Lightspeed competitor, affordable restaurant POS, Lightspeed replacement',
  openGraph: {
    title: 'Best Lightspeed Restaurant Alternative | DineOpen - AI-Powered',
    description: 'Switch from Lightspeed to DineOpen. Get AI voice ordering, lower fees, unlimited locations. Free 30-day trial.',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LightspeedAlternativeClient />
    </>
  );
}
