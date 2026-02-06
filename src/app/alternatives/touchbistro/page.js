import TouchBistroAlternativeClient from './TouchBistroAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best TouchBistro Alternative 2026 | DineOpen - Save 75% on Costs',
  description: 'Looking for a TouchBistro alternative? DineOpen offers AI voice ordering, cloud-based flexibility, no iPad requirement. Save $2,500+/year vs TouchBistro. Free 30-day trial.',
  keywords: 'TouchBistro alternative, TouchBistro POS alternative, better than TouchBistro, TouchBistro competitor, affordable restaurant POS, TouchBistro replacement, cloud POS alternative',
  openGraph: {
    title: 'Best TouchBistro Alternative | DineOpen - Cloud-Based & AI-Powered',
    description: 'Switch from TouchBistro to DineOpen. Cloud-based, AI voice ordering, works on any device. Free 30-day trial.',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TouchBistroAlternativeClient />
    </>
  );
}
