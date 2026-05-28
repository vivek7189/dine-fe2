import QatarClient from './QatarClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen Qatar | Restaurant POS Software in Doha, Qatar',
  description: 'DineOpen is now in Qatar with Booster Trading Services. Get restaurant POS, payment terminal integration (Sadad/WiseCashier), kitchen display, inventory management & AI-powered tools for restaurants in Doha and across Qatar.',
  keywords: 'restaurant POS Qatar, POS software Doha, restaurant management Qatar, Sadad payment terminal, WiseCashier Qatar, cloud POS Qatar, DineOpen Qatar, Booster Trading Services, restaurant technology Qatar, POS system Doha, billing software Qatar, kitchen display system Qatar, restaurant inventory Qatar',
  openGraph: {
    title: 'DineOpen Qatar | Restaurant POS Software in Doha, Qatar',
    description: 'DineOpen partners with Booster Trading Services to bring world-class restaurant POS and payment solutions to Qatar. Cloud POS, Sadad terminal integration, AI voice ordering & more.',
    url: 'https://www.dineopen.com/qatar',
    siteName: 'DineOpen',
    type: 'website',
    locale: 'en_QA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen Qatar | Restaurant POS & Payment Solutions',
    description: 'DineOpen partners with Booster Trading Services to power restaurants across Qatar with cloud POS, Sadad payment integration, and AI-driven tools.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/qatar',
  },
};

export default function QatarPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DineOpen",
    "url": "https://www.dineopen.com",
    "logo": "https://www.dineopen.com/favicon.png",
    "description": "DineOpen is a global restaurant operating system offering Cloud POS, AI voice ordering, payment terminal integration, inventory management, and analytics.",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+974-7052-9114",
        "contactType": "sales",
        "areaServed": "QA",
        "availableLanguage": ["English", "Arabic"],
      },
      {
        "@type": "ContactPoint",
        "telephone": "+974-7023-9555",
        "contactType": "sales",
        "areaServed": "QA",
        "availableLanguage": ["English", "Arabic"],
      },
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Qatar — Booster Trading Services",
    "description": "Official DineOpen partner in Qatar providing restaurant POS software, Sadad payment terminal integration, CCTV installation, and technology solutions for restaurants in Doha and across Qatar.",
    "url": "https://www.dineopen.com/qatar",
    "telephone": "+974-7052-9114",
    "email": "sales@boostertradingservicesqa.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ain Khaled, Souq Al Nayef",
      "addressLocality": "Doha",
      "addressCountry": "QA",
      "postalCode": "19760",
    },
    "areaServed": {
      "@type": "Country",
      "name": "Qatar",
    },
    "parentOrganization": {
      "@type": "Organization",
      "name": "DineOpen",
      "url": "https://www.dineopen.com",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is DineOpen available in Qatar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen is available in Qatar through our official partner Booster Trading Services, based in Doha. They provide sales, installation, training, and ongoing support for all DineOpen products.",
        },
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Sadad payment terminals in Qatar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen integrates with Sadad (WiseCashier) cloud payment terminals and NAPS Qatar direct terminals. Payments are processed directly through the terminal — DineOpen charges zero transaction fees.",
        },
      },
      {
        "@type": "Question",
        "name": "How much does DineOpen cost in Qatar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen starts at $9.99/month with all features included — POS, kitchen display, inventory, analytics, and AI tools. No transaction fees, no hidden charges. Contact our Qatar team for local pricing and deals.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I get a demo of DineOpen in Qatar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Contact Booster Trading Services at +974-7052-9114 or sales@boostertradingservicesqa.com to schedule a free demo at your restaurant in Doha or anywhere in Qatar.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <QatarClient />
    </>
  );
}
