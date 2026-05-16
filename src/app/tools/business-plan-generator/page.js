import BusinessPlanClient from './BusinessPlanClient';

export const dynamic = 'force-static';
export const revalidate = false;

const faqData = [
  {
    q: 'Do I need a business plan to open a restaurant?',
    a: 'Yes — a business plan is essential for opening a restaurant. It forces you to think through your concept, target market, financial projections, and operations before you spend a rupee or dollar. More practically, banks, investors, and landlords will almost always ask for one. A solid restaurant business plan shows you understand the risks and have a clear path to profitability.',
  },
  {
    q: 'How long should a restaurant business plan be?',
    a: 'A complete restaurant business plan is typically 15-30 pages. It should cover: executive summary (1-2 pages), company overview, market analysis (3-5 pages), menu strategy, management team, marketing plan, operations plan, and financial projections (3-5 pages including P&L, cash flow, and balance sheet for 3 years). For investors or bank loans, a longer, more detailed plan is better.',
  },
  {
    q: 'What financial projections should I include?',
    a: 'Your restaurant business plan should include: (1) Startup cost breakdown — one-time investment needed to open; (2) Monthly P&L projection for 3 years — revenue, COGS, gross profit, operating expenses, EBITDA; (3) Break-even analysis — monthly revenue needed to cover all costs; (4) Cash flow statement — month-by-month cash position; (5) ROI calculation — when investors or owners recoup their investment. Key benchmarks: food cost 28-35%, labor cost 25-35%, rent 6-10% of revenue.',
  },
  {
    q: 'How do I estimate restaurant startup costs?',
    a: 'Restaurant startup costs include: interior renovation & design (30-40% of budget), kitchen equipment (15-25%), security deposit & advance rent (10-20%), licenses & permits (2-5%), initial inventory (3-5%), staff training & pre-opening salaries (5-10%), marketing & branding (3-5%), and miscellaneous/contingency (10-15%). In India, a small restaurant needs ₹8-15 lakhs; medium needs ₹20-40 lakhs. In the USA, expect $150,000-$500,000 for a small to mid-size concept.',
  },
  {
    q: 'Can I use this business plan for investors?',
    a: 'Yes — the AI-generated business plan from DineOpen provides a strong starting framework. For investor presentations, you should supplement it with: your own verified local market data and competitive research, actual quotes from suppliers and equipment vendors, personal financial statements and credit history, legal entity details, and a compelling pitch deck. The plan gives you the structure — you add the hyper-local specifics that make investors confident.',
  },
];

export const metadata = {
  title: 'Restaurant Business Plan Generator [Free, AI-Powered] — Complete Plan in Minutes | DineOpen',
  description: 'Generate a complete restaurant business plan in minutes with AI. Includes financial projections, market analysis, menu strategy, operations plan, and marketing plan. Free, no sign-up required. Works for cafes, cloud kitchens, fine dining, QSRs, and more.',
  keywords: 'restaurant business plan template, restaurant business plan generator, cafe business plan, how to write restaurant business plan, restaurant business plan India, restaurant startup plan, restaurant financial projections, restaurant business plan PDF',
  openGraph: {
    title: 'Restaurant Business Plan Generator [Free, AI-Powered] | DineOpen',
    description: 'Create a complete restaurant business plan with AI — financial projections, market analysis, menu strategy, and more. Free, instant, no sign-up.',
    url: 'https://www.dineopen.com/tools/business-plan-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Business Plan Generator [Free, AI-Powered] | DineOpen',
    description: 'Generate a complete restaurant business plan in minutes. Financial projections, market analysis, menu strategy — all AI-powered and free.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/business-plan-generator',
    languages: {
      'en': 'https://www.dineopen.com/tools/business-plan-generator',
      'en-IN': 'https://www.dineopen.com/tools/business-plan-generator',
      'en-US': 'https://www.dineopen.com/tools/business-plan-generator',
      'en-GB': 'https://www.dineopen.com/tools/business-plan-generator',
      'en-AE': 'https://www.dineopen.com/tools/business-plan-generator',
      'x-default': 'https://www.dineopen.com/tools/business-plan-generator',
    },
  },
};

function generateSchemaMarkup() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Restaurant Business Plan Generator',
    description: 'AI-powered tool that generates complete restaurant business plans including financial projections, market analysis, menu strategy, operations plan, and marketing plan.',
    url: 'https://www.dineopen.com/tools/business-plan-generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI-generated executive summary',
      'Market analysis and competitive landscape',
      'Menu strategy and pricing recommendations',
      'Financial projections and revenue forecasts',
      'Operations plan and staffing guide',
      'Marketing and customer acquisition plan',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com/' },
      { '@type': 'ListItem', position: 2, name: 'Free Tools', item: 'https://www.dineopen.com/tools/food-cost-calculator' },
      { '@type': 'ListItem', position: 3, name: 'Business Plan Generator', item: 'https://www.dineopen.com/tools/business-plan-generator' },
    ],
  };

  return [webAppSchema, faqSchema, breadcrumbSchema];
}

export default function BusinessPlanGeneratorPage() {
  const schemas = generateSchemaMarkup();
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BusinessPlanClient />
    </>
  );
}
