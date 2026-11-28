import MultiRestaurantClient from './MultiRestaurantClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Multi-Restaurant POS for Chains & Franchises | DineOpen',
  description: 'Manage all your restaurant outlets from one dashboard. Multi-location POS for chains, franchises & enterprise. Central menu, inventory, reports. Pro is $99/month for 2 outlets (£79 UK), 3+ outlets on a custom quote; India from ₹799 per outlet per month. Free trial.',
  keywords: 'multi restaurant POS, chain restaurant software, franchise POS system, multi location restaurant management, enterprise restaurant software, restaurant chain management, multi outlet POS India, central kitchen management, franchise management software, multi branch restaurant',
  openGraph: {
    title: 'Multi-Restaurant POS | Chain & Franchise Solution | DineOpen',
    description: 'One dashboard for all your outlets. Central menu, stock and reports. Perfect for chains & franchises.',
    url: 'https://www.dineopen.com/products/multi-restaurant',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-multi-restaurant.jpg', width: 1200, height: 630, alt: 'DineOpen Multi-Restaurant Management' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Restaurant POS | Chain & Franchise Solution | DineOpen',
    description: 'One dashboard for all your outlets. Pro $99/month for 2 outlets, 3+ on a custom quote; India from ₹799 per outlet.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/multi-restaurant',
  },
};

export default function MultiRestaurantPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Multi-Restaurant Management",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Enterprise Restaurant Management",
    "description": "Manage all your restaurant outlets from a single dashboard. Central menu management and consolidated reporting for chains and franchises.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/multi-restaurant",
    "offers": [
      {
        "@type": "Offer",
        "price": "99",
        "priceCurrency": "USD",
        "description": "Pro plan, 2 outlets, per month (3+ outlets: custom quote)"
      },
      {
        "@type": "Offer",
        "price": "799",
        "priceCurrency": "INR",
        "description": "From, per outlet per month",
        "eligibleRegion": "IN"
      }
    ],
    "featureList": [
      "Centralized dashboard",
      "Central menu management",
      "Consolidated reporting",
      "Per-outlet analytics",
      "Role-based access control",
      "Central inventory management",
      "Multi-brand support"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does multi-restaurant POS cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Outside India, the Pro plan is $99/month (£79 in the UK) for 2 outlets, with central menu, inventory, staff and outlet-wise profit and loss. For 3 or more outlets DineOpen gives a custom quote. In India, plans start from ₹799 per outlet per month. No setup fee."
        }
      },
      {
        "@type": "Question",
        "name": "Can I manage menu centrally for all outlets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Update your menu once and push changes to all outlets instantly. Or customize menus per location if needed - both options are available."
        }
      },
      {
        "@type": "Question",
        "name": "How does role-based access work for chains?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Configure access levels - outlet managers see only their location, area managers see their region, and owners see everything. Control what franchisees can and cannot change."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a limit on number of outlets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "There is no fixed outlet limit. Pro covers 2 outlets; for 3 or more outlets, franchises and cloud-kitchen groups DineOpen gives a custom quote based on your size."
        }
      },
      {
        "@type": "Question",
        "name": "Can I see consolidated reports across all outlets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! View consolidated sales, inventory, and performance across all locations in one dashboard. Also drill down to per-outlet analytics for detailed insights."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MultiRestaurantClient />
    </>
  );
}
