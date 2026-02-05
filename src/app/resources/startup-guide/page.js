import StartupGuideClient from './StartupGuideClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'How to Open a Restaurant in India 2024 | Complete Startup Guide | DineOpen',
  description: 'Step-by-step guide to opening a restaurant in India. Covers FSSAI license, location selection, menu planning, staffing, POS setup, marketing. Free checklist included.',
  keywords: 'how to open restaurant India, start restaurant business, restaurant startup guide, FSSAI license process, restaurant permits India, cafe startup checklist, restaurant opening costs India',
  openGraph: {
    title: 'How to Open a Restaurant in India | Complete Guide | DineOpen',
    description: 'Complete guide to starting a restaurant in India. FSSAI, permits, costs, and step-by-step checklist.',
    url: 'https://www.dineopen.com/resources/startup-guide',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/startup-guide',
  },
};

export default function StartupGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Open a Restaurant in India",
    "description": "Complete step-by-step guide to opening a restaurant in India, including licenses, permits, and operational setup.",
    "totalTime": "P90D",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "1500000"
    },
    "step": [
      { "@type": "HowToStep", "name": "Business Planning", "text": "Create business plan, finalize concept, and arrange funding" },
      { "@type": "HowToStep", "name": "Legal Setup", "text": "Register business, get FSSAI license, and other permits" },
      { "@type": "HowToStep", "name": "Location & Setup", "text": "Find location, design interior, and set up kitchen" },
      { "@type": "HowToStep", "name": "Operations", "text": "Hire staff, set up POS, create menu, and launch marketing" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StartupGuideClient />
    </>
  );
}
