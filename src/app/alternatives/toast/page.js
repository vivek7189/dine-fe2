import ToastAlternativeClient from './ToastAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Toast POS Pricing 2026 & a Cheaper Alternative (No Contract) | DineOpen',
  description: 'Toast POS costs $0 (Starter Kit, higher card rate) or $69/month (Point of Sale) plus 2.49% + 15¢ per card payment. Compare with DineOpen from $20/month, any device, no contract.',
  keywords: 'Toast alternative, Toast POS alternative, Toast POS pricing, Toast POS cost, Toast competitor, Toast replacement, restaurant POS no contract',
  openGraph: {
    title: 'Toast POS Pricing 2026 & a Cheaper Alternative | DineOpen',
    description: 'What Toast really costs (software, card fees, hardware) and how DineOpen compares: from $20/month, any device, no contract.',
    url: 'https://www.dineopen.com/alternatives/toast',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-toast-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'Toast POS pricing compared with DineOpen',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toast POS Pricing 2026 & a Cheaper Alternative | DineOpen',
    description: 'Toast: $0 or $69/month + 2.49% + 15¢ per card payment. DineOpen: from $20/month, any device, no contract.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/toast',
  },
};

const FAQS = [
  {
    q: 'How much does Toast POS cost per month in 2026?',
    a: 'Toast lists two main plans: the Starter Kit at $0 a month (for one or two terminals, with a higher card processing rate) and Point of Sale at $69 a month, where in-person card payments are 2.49% + 15 cents. Larger setups are quoted. Hardware and add-ons are extra.',
  },
  {
    q: 'Is the Toast Starter Kit really free?',
    a: 'The software is $0 a month, but Toast charges a higher card rate on that plan, so you pay through card fees instead. For a busy restaurant the card fees are usually much bigger than the software fee, so compare the total, not the monthly price.',
  },
  {
    q: 'Is DineOpen cheaper than Toast?',
    a: 'On software, yes for most restaurants. DineOpen Starter is $20 a month (POS, QR ordering, KOT printing, basic inventory) and Growth is $50 a month (adds kitchen display, online ordering website, AI voice ordering and advanced inventory), compared with $69 a month for Toast Point of Sale. DineOpen does not add a charge on your card payments; you keep the card terminal and processor you choose.',
  },
  {
    q: 'Does DineOpen need special hardware like Toast?',
    a: 'No. DineOpen runs on phones, tablets and computers you already have (web, Android, Windows and Mac) and works with common thermal receipt printers. Toast runs on Toast hardware.',
  },
  {
    q: 'Which countries are Toast and DineOpen available in?',
    a: 'Toast sells its POS in the United States, Canada, the UK, Ireland and Australia, and some Toast products such as Payroll and Capital are US only. DineOpen is available worldwide, with local tax (sales tax, VAT, GST, HST) and local pricing, for example £16 a month in the UK.',
  },
  {
    q: 'Is there a contract with DineOpen?',
    a: 'No. DineOpen is month to month with a 7-day free trial, and you can cancel any time. With Toast, ask for the term length in writing before you sign, because terms depend on the plan and quote.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function ToastAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToastAlternativeClient faqs={FAQS} />
    </>
  );
}
