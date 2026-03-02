import SmallBusinessClient from './SmallBusinessClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best POS System for Small Business 2026 | Affordable Restaurant POS | DineOpen',
  description: 'Best POS system for small business restaurants. Free plan available. Easy billing, QR menus, inventory tracking, GST compliance. Built for small restaurants, dhabas, cafes & food stalls.',
  keywords: 'pos system for small business, best pos system for small business, small business pos system, small restaurant pos, affordable pos system, cheap pos for restaurant, free pos system restaurant, pos for small restaurant India, small business billing software',
  openGraph: {
    title: 'Best POS System for Small Business 2026 | DineOpen',
    description: 'Affordable POS system built for small business restaurants. Free plan, easy setup, no hardware needed.',
    url: 'https://www.dineopen.com/for/small-business',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best POS System for Small Business 2026 | DineOpen',
    description: 'Affordable POS system built for small business restaurants. Free plan, easy setup, no hardware needed.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/small-business',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS system for a small business restaurant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS system for small business restaurants. It offers a free Starter plan, works on any device (phone, tablet, laptop), requires no special hardware, and includes billing, QR menus, inventory tracking, and GST compliance out of the box."
      }
    },
    {
      "@type": "Question",
      "name": "How much does a POS system cost for a small restaurant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers a free Starter plan for small restaurants. Paid plans start at just $9.99/month (approximately ₹300/month in India). There are no setup fees, no hardware costs, and no long-term contracts."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use a POS system on my phone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is a cloud-based POS that works on any smartphone, tablet, or laptop. No special POS hardware or terminals needed. Just log in from any device with a browser and start billing."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free POS system for small restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a completely free Starter plan for small restaurants. It includes basic billing, QR code menus, and order management. You can upgrade anytime as your business grows."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need special hardware for a restaurant POS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. DineOpen works on any existing device — your phone, tablet, or laptop. No need to buy expensive POS terminals, receipt printers, or dedicated hardware. This makes it the most affordable POS for small businesses."
      }
    },
    {
      "@type": "Question",
      "name": "What features should a small business POS have?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A good small business POS should include: easy billing, inventory management, GST/tax compliance, digital menus (QR codes), customer management, basic reporting, and delivery app integration. DineOpen includes all these features even in the free plan."
      }
    }
  ]
};

export default function SmallBusinessPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SmallBusinessClient />
    </>
  );
}
