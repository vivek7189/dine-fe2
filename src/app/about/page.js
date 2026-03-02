import AboutClient from './AboutClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'About DineOpen | Our Mission to Power Every Restaurant',
  description: 'Learn about DineOpen — the global restaurant operating system powering 1000+ restaurants across 20+ countries. Our mission, story, and team.',
  keywords: 'about DineOpen, DineOpen team, restaurant technology company, DineOpen mission, restaurant software company',
  openGraph: {
    title: 'About DineOpen | Our Mission to Power Every Restaurant',
    description: 'Learn about DineOpen — the global restaurant operating system powering 1000+ restaurants across 20+ countries.',
    url: 'https://www.dineopen.com/about',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About DineOpen | Our Mission to Power Every Restaurant',
    description: 'The global restaurant operating system powering 1000+ restaurants across 20+ countries.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/about',
  },
};

export default function AboutPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DineOpen",
    "url": "https://www.dineopen.com",
    "logo": "https://www.dineopen.com/favicon.png",
    "description": "DineOpen is a global restaurant operating system offering Cloud POS, AI voice ordering, waiter apps, inventory management, analytics, and loyalty programs.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/dineopen",
      "https://www.linkedin.com/company/dineopen",
      "https://www.instagram.com/dineopen",
      "https://www.youtube.com/@dineopen"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@dineopen.com",
      "contactType": "customer support",
      "availableLanguage": "English"
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <AboutClient />
    </>
  );
}
