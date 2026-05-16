import RestaurantQuizClient from './RestaurantQuizClient';

export const dynamic = 'force-static';
export const revalidate = false;

const faqData = [
  {
    q: 'How much money do I need to open a restaurant?',
    a: 'The amount varies widely by location and concept. In India, a small restaurant can start with 10-20 lakhs, while a full-service restaurant may need 50 lakhs or more. In the USA, expect $150,000-$500,000 for a small to mid-size restaurant. Key cost drivers include rent deposit, kitchen equipment, interior fit-out, licenses, and 3-6 months of working capital. Use our Startup Cost Calculator for a detailed estimate.',
  },
  {
    q: "What's the success rate for new restaurants?",
    a: 'Industry research consistently shows that approximately 60% of restaurants fail within their first year, and around 80% close within five years. The most common reasons include undercapitalization, poor location choice, lack of management experience, weak concept differentiation, and failure to control food and labor costs. However, well-prepared owners with industry experience, adequate capital, and a clear business plan significantly improve their odds.',
  },
  {
    q: 'Do I need restaurant experience to open one?',
    a: 'While not legally required, restaurant experience dramatically improves your chances of success. Owners with industry experience understand kitchen operations, staff management, food cost control, and customer service nuances that take years to learn. If you lack experience, consider working in a restaurant for 6-12 months, partnering with an experienced operator, or hiring a strong operations manager before opening.',
  },
  {
    q: 'What licenses do I need to open a restaurant?',
    a: 'Required licenses vary by country and region. In India: FSSAI license, GST registration, Shop & Establishment Act license, Fire NOC, and local municipal permits. In the USA: business license, food service permit, health department certificate, building permit, and potentially a liquor license. In the UK: premises licence, food business registration with local authority, and food hygiene certification. Research your specific local requirements at least 6 months before your planned opening.',
  },
  {
    q: 'How long does it take to open a restaurant?',
    a: 'From concept to opening day, most restaurants take 6-18 months to launch. Key phases include: concept development and business plan (1-2 months), location search and lease negotiation (2-4 months), design and build-out (3-6 months), licensing and permits (1-3 months, can run parallel), equipment procurement and installation (1-2 months), hiring and training (1-2 months), and soft opening/testing (2-4 weeks). Starting the licensing process early is critical as it is often the biggest bottleneck.',
  },
];

export const metadata = {
  title: 'Should I Open a Restaurant? [Free Quiz] — Readiness Score | DineOpen',
  description:
    'Take our free interactive quiz to find out if you are ready to open a restaurant. Get a personalized readiness score, category breakdown, and actionable recommendations based on your experience, finances, planning, and mindset.',
  keywords:
    'should I open a restaurant quiz, restaurant readiness test, am I ready to open a restaurant, restaurant startup quiz, restaurant business quiz, opening a restaurant checklist, restaurant feasibility test, start a restaurant quiz',
  openGraph: {
    title: 'Should I Open a Restaurant? [Free Quiz] — Readiness Score | DineOpen',
    description:
      'Get your personalized restaurant readiness score in 3 minutes. 15-question quiz covering experience, finances, planning, execution, and mindset.',
    url: 'https://www.dineopen.com/tools/restaurant-quiz',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Should I Open a Restaurant? [Free Quiz] | DineOpen',
    description:
      'Find out if you are truly ready to open a restaurant with our free 15-question readiness quiz. Get a score, grade, and personalized action plan.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/restaurant-quiz',
  },
};

function generateSchemaMarkup() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Should I Open a Restaurant? Quiz',
    description:
      'A free interactive quiz that assesses your readiness to open a restaurant across five key dimensions: experience, finance, planning, execution, and mindset.',
    url: 'https://www.dineopen.com/tools/restaurant-quiz',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
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
      { '@type': 'ListItem', position: 3, name: 'Restaurant Readiness Quiz', item: 'https://www.dineopen.com/tools/restaurant-quiz' },
    ],
  };

  return [webAppSchema, faqSchema, breadcrumbSchema];
}

export default function RestaurantQuizPage() {
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
      <RestaurantQuizClient />
    </>
  );
}
