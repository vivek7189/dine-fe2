import PartnersClient from './PartnersClient';
import { PARTNER_FAQS } from './faqs';

export const dynamic = 'force-static';

export const metadata = {
  title: 'DineOpen Partner Program: 20% Recurring Commission',
  description: 'Partner with DineOpen and receive 20% of every restaurant subscription you introduce, every month for as long as they stay with us. Free to join, open to dealers, accountants, consultants and agencies worldwide.',
  alternates: { canonical: 'https://www.dineopen.com/partners' },
  openGraph: {
    title: 'Become a DineOpen Partner',
    description: '20% recurring commission on every restaurant you introduce, for as long as they stay with us. Free to join.',
    url: 'https://www.dineopen.com/partners',
    siteName: 'DineOpen',
    type: 'website',
  },
};

export default function PartnersPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PARTNER_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com/' },
      { '@type': 'ListItem', position: 2, name: 'Partners', item: 'https://www.dineopen.com/partners' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PartnersClient />
    </>
  );
}
