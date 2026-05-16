import ElectricityCalculatorClient from './ElectricityCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Electricity Cost Calculator [Free] — Utility Bill Estimator | DineOpen',
  description: 'Calculate your restaurant electricity costs by equipment type with accurate regional rates for India (Maharashtra, Delhi, Karnataka, Tamil Nadu, Gujarat), US, UK, UAE, and Qatar. Estimate monthly utility bills, identify energy savings, and benchmark electricity as a percentage of revenue.',
  keywords: 'restaurant electricity cost calculator, commercial kitchen electricity bill, restaurant utility cost, restaurant AC cost calculator, restaurant energy cost, utility bill estimator restaurant, commercial kitchen power consumption, restaurant electricity saving tips',
  openGraph: {
    title: 'Restaurant Electricity Cost Calculator [Free] | DineOpen',
    description: 'Estimate your monthly restaurant electricity bill by equipment. Regional rates for India, US, UK, UAE, Qatar. Find savings and optimize energy costs.',
    url: 'https://www.dineopen.com/tools/electricity-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Electricity Cost Calculator [Free] | DineOpen',
    description: 'Estimate your monthly restaurant electricity bill by equipment. Regional rates for India, US, UK, UAE, Qatar.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/electricity-calculator',
  },
};

export default function ElectricityCalculatorPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Restaurant Electricity Cost Calculator',
    description: 'Free tool to estimate monthly electricity costs for restaurants and commercial kitchens. Supports regional electricity rates for India, US, UK, UAE, and Qatar. Calculate costs by equipment, find savings, and benchmark utility spend as a percentage of revenue.',
    url: 'https://www.dineopen.com/tools/electricity-calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the average electricity bill for a restaurant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Average restaurant electricity bills vary widely by size, type, and location. In India, a small restaurant typically pays ₹8,000–₹25,000 per month, while a medium-sized restaurant can expect ₹25,000–₹80,000 per month. In the US, the average commercial restaurant electricity bill ranges from $1,000 to $5,000 per month. In the UK, expect £800–£3,000 per month. Electricity generally accounts for 3–5% of a restaurant\'s total revenue.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much electricity does a commercial kitchen use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A commercial kitchen typically consumes 1,000–5,000 kWh per month depending on equipment and operating hours. High-consumption equipment includes electric ovens (3,000W), induction cooktops (2,000W), and commercial dishwashers (1,800W). Air conditioning is often the single largest electricity consumer in restaurants, especially in tropical climates like India, accounting for 40–60% of total electricity use in many establishments.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I reduce my restaurant\'s electricity bill?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most effective ways to reduce restaurant electricity costs include: (1) Switching to inverter air conditioners, which use 30–50% less electricity than conventional models. (2) Replacing all lighting with LED bulbs, cutting lighting costs by up to 75%. (3) Installing solar panels — a typical restaurant rooftop can offset 30–50% of electricity consumption. (4) Scheduling energy-intensive operations like dishwashing and cooking during off-peak hours where time-of-use tariffs apply. (5) Regular maintenance of refrigeration equipment and AC units to maintain efficiency.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I switch to solar for my restaurant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Solar is increasingly viable for restaurants, especially in India where government subsidies of 20–40% are available under PM Surya Ghar and state schemes. A typical 10kW rooftop solar system costs ₹5–7 lakhs before subsidies and can generate 1,200–1,400 kWh per month, offsetting ₹10,000–₹15,000 in electricity costs. The payback period is typically 4–6 years, with a system lifespan of 25 years. In the UAE, DEWA\'s net metering program allows restaurants to sell surplus power back to the grid.',
        },
      },
      {
        '@type': 'Question',
        name: 'What percentage of restaurant revenue should go to electricity and utilities?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Industry benchmarks suggest electricity and utilities should account for 3–8% of a restaurant\'s gross revenue. Electricity alone typically represents 3–5% of revenue, with the remainder covering gas, water, and internet. Fine dining establishments with climate-controlled environments may spend up to 6–8%, while cloud kitchens and QSR concepts often operate at 2–4% due to smaller spaces and leaner operations. If your electricity exceeds 8% of revenue, prioritizing energy efficiency investments is strongly recommended.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Tools', item: 'https://www.dineopen.com/tools/food-cost-calculator' },
      { '@type': 'ListItem', position: 3, name: 'Electricity Cost Calculator', item: 'https://www.dineopen.com/tools/electricity-calculator' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ElectricityCalculatorClient />
    </>
  );
}
