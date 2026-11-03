import SalarySlipClient from './SalarySlipClient';
import { FAQ } from './slipContent';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools/salary-slip-generator';

export const metadata = {
  title: 'Free Salary Slip Generator with Logo (India, PDF) | DineOpen',
  description: 'Make a salary slip for restaurant and shop staff in minutes. Add your logo, days worked and pay; PF, ESI and leave cuts are worked out, with net pay in words. Download PDF or print. Free, no signup.',
  keywords: 'salary slip generator, salary slip format, salary slip format pdf, salary slip generator online free with logo, salary slip for restaurant staff, payslip format india, salary slip with pf esi',
  openGraph: {
    title: 'Free Salary Slip Generator (India, PDF)',
    description: 'Salary slips for restaurant and shop staff, with PF, ESI, leave cuts and net pay in words.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Salary Slip Generator (India, PDF)',
    description: 'Salary slips for restaurant and shop staff, with PF, ESI, leave cuts and net pay in words.',
  },
  alternates: { canonical: URL },
};

export default function SalarySlipGeneratorPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Salary Slip Generator (India)',
      description: 'Make a monthly salary slip with logo, paid days, PF, ESI, professional tax and advance recovery, and download it as a PDF.',
      url: URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      provider: { '@type': 'Organization', name: 'DineOpen', url: 'https://www.dineopen.com' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com' },
        { '@type': 'ListItem', position: 2, name: 'Free Tools', item: 'https://www.dineopen.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Salary Slip Generator', item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <SalarySlipClient />
    </>
  );
}
