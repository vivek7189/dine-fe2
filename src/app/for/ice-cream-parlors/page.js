import IceCreamParlorsClient from './IceCreamParlorsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best POS System for Ice Cream Shop 2026 | Ice Cream Parlor Software | DineOpen',
  description: 'Best POS system for ice cream shop with scoop billing, combo offers, loyalty programs & seasonal menu management. Ice cream POS system for parlors, gelato shops & frozen dessert stores. Free trial, zero transaction fees.',
  keywords: 'best pos system for ice cream shop, pos system for ice cream shop, ice cream pos system, pos for ice cream shop, ice cream parlor POS, ice cream shop software, gelato shop POS, frozen dessert billing, scoop billing software, ice cream shop management, dessert parlor POS, ice cream billing software',
  openGraph: {
    title: 'Best POS System for Ice Cream Shop | Ice Cream Parlor Software | DineOpen',
    description: 'Best POS system for ice cream shops with scoop billing, combo offers, loyalty programs, and seasonal menu management. Free trial.',
    url: 'https://www.dineopen.com/for/ice-cream-parlors',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best POS System for Ice Cream Shop | DineOpen',
    description: 'Ice cream POS system with scoop billing, combos, loyalty & seasonal menus. Free trial.',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/ice-cream-parlors' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS system for ice cream shop?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS system for ice cream shops in 2026. It offers scoop-based billing, topping customizations, combo pricing, loyalty programs, seasonal menu management, and QR ordering to handle queues. Starting at $9.99/month with zero transaction fees and a free 30-day trial."
      }
    },
    {
      "@type": "Question",
      "name": "How much does an ice cream POS system cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen ice cream POS system starts at $9.99/month (₹300/month in India) with all features included — scoop billing, combo offers, loyalty programs, and seasonal menus. No transaction fees. The Blaze plan at $89/month supports unlimited locations for ice cream chains."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle scoop-based billing and toppings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen POS system for ice cream shops supports scoop-based pricing with topping add-ons, cone/cup/waffle options, and sundae customizations. The visual menu lets even new staff bill perfectly during peak summer rush."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support loyalty programs for ice cream parlors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers built-in loyalty programs including birthday clubs, points per purchase, and referral rewards. Ice cream parlors can run seasonal promotions and track customer preferences to boost repeat visits."
      }
    },
    {
      "@type": "Question",
      "name": "What features should I look for in a POS for ice cream shop?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The best POS for ice cream shops should include: scoop-based billing with topping add-ons, combo and bundle pricing, seasonal menu management, customer loyalty programs, QR code ordering for queue management, real-time flavor availability tracking, and delivery/takeaway support. DineOpen includes all these features."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for ice cream parlors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 30-day free trial with no credit card required. You get full access to all ice cream POS features including scoop billing, loyalty programs, seasonal menu management, and multi-location support."
      }
    }
  ]
};

export default function IceCreamParlorsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <IceCreamParlorsClient />
    </>
  );
}
