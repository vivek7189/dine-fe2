import ShiftSchedulerClient from './ShiftSchedulerClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Staff Shift Scheduler [Free] — Weekly Rota Planner | DineOpen',
  description:
    'Free visual shift scheduler for restaurant staff. Build weekly rotas with a drag-and-drop grid, track labor costs in real time, get overtime alerts, and print your schedule. No login required.',
  keywords:
    'restaurant staff scheduling template free, employee shift planner, weekly rota template restaurant, staff roster maker, restaurant shift schedule, staff scheduling tool, restaurant employee scheduling, weekly staff planner, shift management restaurant, labor scheduling tool',
  openGraph: {
    title: 'Restaurant Staff Shift Scheduler [Free] — Weekly Rota Planner | DineOpen',
    description:
      'Plan weekly shifts, track labor costs, and manage overtime with a free visual shift planner built for restaurants.',
    url: 'https://www.dineopen.com/tools/shift-scheduler',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Staff Shift Scheduler [Free] — Weekly Rota Planner | DineOpen',
    description:
      'Plan weekly shifts, track labor costs, and manage overtime with a free visual shift planner built for restaurants.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/shift-scheduler',
  },
};

export default function ShiftSchedulerPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Restaurant Staff Shift Scheduler',
    description:
      'Free visual shift scheduling tool for restaurants. Plan weekly rotas, track labor costs, and manage overtime alerts.',
    url: 'https://www.dineopen.com/tools/shift-scheduler',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Visual weekly shift grid',
      'Labor cost tracking',
      'Overtime alerts',
      'Multiple shift types',
      'Print-ready schedule',
      'Multi-currency support',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I schedule shifts for restaurant staff?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start by listing all staff and their roles. Identify your peak hours — typically lunch (12–3pm) and dinner (6–10pm) — and schedule more staff during those windows. Use a visual grid like this free tool to assign Morning (6am–2pm), Afternoon (2pm–10pm), Night (10pm–6am), or Split (11am–3pm and 6pm–11pm) shifts. Always publish the schedule at least one week in advance so staff can plan.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I track overtime for restaurant employees?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Overtime thresholds vary by country: India and UK allow 48 hours/week before overtime applies; the US sets the threshold at 40 hours/week; UAE and Qatar follow a 48-hour standard. This shift scheduler automatically calculates weekly hours per staff member, flags anyone over the threshold, and estimates overtime pay at 1.5x the base hourly rate.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a good labor cost percentage for restaurants?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most full-service restaurants target a labor cost of 28–35% of revenue. Fast-casual and QSR formats often aim for 25–30%. Fine dining can run 35–40% due to higher skill requirements. Use the summary panel in this tool to calculate your total weekly labor spend, then compare it against your projected weekly revenue to stay within your target range.',
        },
      },
      {
        '@type': 'Question',
        name: 'How far in advance should I schedule restaurant staff?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Best practice is to publish the shift schedule at least 7–14 days in advance. This gives staff time to arrange childcare, transportation, and personal commitments, which reduces last-minute call-outs. Some jurisdictions in the US (notably California and New York) require advance scheduling notice by law. Posting schedules 2 weeks out is the industry gold standard.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a rota template for a restaurant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A rota (or roster) template is a pre-formatted weekly schedule that lists each staff member in rows and the days of the week in columns. Each cell shows the shift assigned to that person on that day. A good restaurant rota template includes shift times, role indicators, total weekly hours per employee, and labor cost totals. This free shift scheduler provides all of those features in an interactive, printable format.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.dineopen.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Free Tools',
        item: 'https://www.dineopen.com/tools/food-cost-calculator',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Shift Scheduler',
        item: 'https://www.dineopen.com/tools/shift-scheduler',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ShiftSchedulerClient />
    </>
  );
}
