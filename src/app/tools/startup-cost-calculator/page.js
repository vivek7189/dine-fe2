import StartupCostClient from './StartupCostClient';

export const dynamic = 'force-static';
export const revalidate = false;

const faqData = [
  { q: 'How much does it cost to open a restaurant?', a: 'Restaurant startup costs vary widely by country, location, and concept. In the USA, a small cafe can start from $175,000-$200,000, while full-service restaurants may need $800,000-$1,000,000+. In India, a small restaurant can begin with 8-10 lakhs, while a medium-sized one needs 20-25 lakhs. Use the calculator above to get a personalized estimate for your specific country and restaurant type.' },
  { q: 'What are the biggest startup expenses for a restaurant?', a: 'The three largest expenses are typically: (1) Interior design and renovation (25-35% of total budget), (2) Kitchen equipment and fit-out (15-25%), and (3) Security deposit and advance rent (10-20%). Together, these account for 60-80% of total startup costs.' },
  { q: 'How long until a restaurant becomes profitable?', a: 'Most restaurants take 12-24 months to become consistently profitable, though some may take 3-5 years. Quick-service and cafe concepts often reach profitability faster (6-12 months) than fine dining establishments.' },
  { q: 'Do I need a liquor license to open a restaurant?', a: 'A liquor license is only required if you plan to serve alcoholic beverages. Costs and processes vary significantly by country. In the USA, licenses range from $300 to $14,000+ depending on the state. In the UK, a premises licence is typically 100-1,905 GBP.' },
  { q: 'What technology do I need to start a restaurant?', a: 'At minimum, you need a POS (Point of Sale) system for billing and order management. Modern cloud-based POS systems like DineOpen also include inventory management, staff management, analytics, and online ordering.' },
];

export const metadata = {
  title: 'Restaurant Startup Cost Calculator [Free] — Estimate Opening Costs Worldwide | DineOpen',
  description: 'Free restaurant startup cost calculator for 7 countries — India, USA, UK, UAE, Canada, Australia, Singapore. Estimate rent, equipment, licenses, inventory, and total investment needed to open a restaurant.',
  keywords: 'restaurant startup cost calculator, how much to open restaurant, restaurant opening cost calculator, restaurant investment calculator, cost to start restaurant, restaurant cost USA, restaurant cost UK, restaurant cost India, restaurant cost UAE, restaurant cost Canada, restaurant cost Australia, restaurant cost Singapore',
  openGraph: {
    title: 'Restaurant Startup Cost Calculator [Free] — 7 Countries | DineOpen',
    description: 'Estimate total investment to open a restaurant in India, USA, UK, UAE, Canada, Australia, or Singapore. Covers rent, equipment, licenses & more.',
    url: 'https://www.dineopen.com/tools/startup-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/startup-cost-calculator',
    languages: {
      'en': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-IN': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-US': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-GB': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-AE': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-CA': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-AU': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'en-SG': 'https://www.dineopen.com/tools/startup-cost-calculator',
      'x-default': 'https://www.dineopen.com/tools/startup-cost-calculator',
    },
  },
};

function generateSchemaMarkup() {
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
      { '@type': 'ListItem', position: 3, name: 'Startup Cost Calculator', item: 'https://www.dineopen.com/tools/startup-cost-calculator' },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Restaurant Startup Cost Calculator',
    description: 'Free calculator to estimate restaurant startup costs across 7 countries including India, USA, UK, UAE, Canada, Australia, and Singapore.',
    url: 'https://www.dineopen.com/tools/startup-cost-calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return [faqSchema, breadcrumbSchema, softwareSchema];
}

export default function StartupCostCalculatorPage() {
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
      <StartupCostClient />
    </>
  );
}
