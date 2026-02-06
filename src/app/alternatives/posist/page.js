import POSistAlternativeClient from './POSistAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best POSist Alternative 2026 | DineOpen - Save 60% on Restaurant POS',
  description: 'Looking for a POSist alternative in India? DineOpen offers AI voice ordering, lower monthly fees, better support. Save ₹50,000+/year vs POSist. Free 30-day trial.',
  keywords: 'POSist alternative, POSist POS alternative, better than POSist, POSist competitor India, affordable restaurant POS India, POSist replacement, restaurant billing software India',
  openGraph: {
    title: 'Best POSist Alternative | DineOpen - AI-Powered Restaurant POS India',
    description: 'Switch from POSist to DineOpen. AI voice ordering, lower fees, better Indian restaurant support. Free trial.',
    url: 'https://www.dineopen.com/alternatives/posist',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best POSist Alternative | DineOpen - Save 60%',
    description: 'Switch from POSist to DineOpen. AI voice ordering, lower fees. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/posist',
  },
};

export default function POSistAlternativePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "POSist Alternative - DineOpen",
    "description": "Compare DineOpen vs POSist POS for Indian restaurants. Features, pricing, and why restaurants switch.",
    "url": "https://www.dineopen.com/alternatives/posist"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <POSistAlternativeClient />
    </>
  );
}
