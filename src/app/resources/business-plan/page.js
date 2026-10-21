import BusinessPlanClient from './BusinessPlanClient';
import { FAQS } from './planContent';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Business Plan Template (Free) – India 2026',
  description: 'Free restaurant business plan template for India: 7 sections to fill in, startup cost by format (cloud kitchen ₹5-15 lakh, café ₹5-12 lakh), a sample P&L and a free generator. No sign-up.',
  keywords: 'restaurant business plan template, restaurant business plan India, cafe business plan, cloud kitchen business plan, restaurant project report, restaurant business plan PDF',
  openGraph: {
    title: 'Restaurant Business Plan Template (Free) – India 2026',
    description: 'Fill-in template, startup costs by format, a sample P&L and a free generator. No sign-up.',
    url: 'https://www.dineopen.com/resources/business-plan',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/business-plan',
  },
};

export default function BusinessPlanPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BusinessPlanClient />
    </>
  );
}
