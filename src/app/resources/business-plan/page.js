import BusinessPlanClient from './BusinessPlanClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Business Plan Template 2024 | Download PDF | DineOpen',
  description: 'Download free restaurant business plan template with financial projections, market analysis, menu planning, and operational strategy. Perfect for bank loans, investors, and FSSAI license.',
  keywords: 'restaurant business plan template, restaurant business plan PDF, restaurant financial projections, how to write restaurant business plan, restaurant business plan India, cafe business plan template, restaurant investor pitch',
  openGraph: {
    title: 'Free Restaurant Business Plan Template | DineOpen',
    description: 'Complete restaurant business plan template with financial projections and market analysis. Free download.',
    url: 'https://www.dineopen.com/resources/business-plan',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-business-plan.jpg', width: 1200, height: 630, alt: 'Restaurant Business Plan Template' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/business-plan',
  },
};

export default function BusinessPlanPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Write a Restaurant Business Plan",
    "description": "Step-by-step guide to creating a comprehensive restaurant business plan with financial projections and market analysis.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Executive Summary",
        "text": "Write a compelling overview of your restaurant concept, mission, and financial highlights."
      },
      {
        "@type": "HowToStep",
        "name": "Market Analysis",
        "text": "Research your target market, competition, and location demographics."
      },
      {
        "@type": "HowToStep",
        "name": "Menu & Operations",
        "text": "Detail your menu concept, pricing strategy, and operational workflow."
      },
      {
        "@type": "HowToStep",
        "name": "Financial Projections",
        "text": "Create 3-year revenue forecasts, break-even analysis, and funding requirements."
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BusinessPlanClient />
    </>
  );
}
