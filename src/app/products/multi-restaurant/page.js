import MultiRestaurantClient from './MultiRestaurantClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Multi-Restaurant POS | Chain & Franchise Management | Unlimited Outlets | DineOpen',
  description: 'Manage unlimited restaurant outlets from one dashboard. Multi-location POS for chains, franchises & enterprise. Central menu, inventory, reports. Just ₹999/outlet/month ($10 international). Free trial.',
  keywords: 'multi restaurant POS, chain restaurant software, franchise POS system, multi location restaurant management, enterprise restaurant software, restaurant chain management, multi outlet POS India, central kitchen management, franchise management software, multi branch restaurant',
  openGraph: {
    title: 'Multi-Restaurant POS | Chain & Franchise Solution | DineOpen',
    description: 'One dashboard for unlimited restaurants. Central control, per-outlet pricing. Perfect for chains & franchises.',
    url: 'https://www.dineopen.com/products/multi-restaurant',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-multi-restaurant.jpg', width: 1200, height: 630, alt: 'DineOpen Multi-Restaurant Management' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Restaurant POS | Chain & Franchise Solution | DineOpen',
    description: 'One dashboard for unlimited restaurants. Just ₹999/outlet or $10/outlet.',
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
    "description": "Manage unlimited restaurant outlets from a single dashboard. Central menu management, consolidated reporting, per-outlet pricing for chains and franchises.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/multi-restaurant",
    "offers": [
      {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "USD",
        "description": "Per outlet per month",
        "eligibleRegion": ["US", "GB"]
      },
      {
        "@type": "Offer",
        "price": "999",
        "priceCurrency": "INR",
        "description": "Per outlet per month",
        "eligibleRegion": "IN"
      }
    ],
    "featureList": [
      "Unlimited outlet support",
      "Centralized dashboard",
      "Central menu management",
      "Consolidated reporting",
      "Per-outlet analytics",
      "Role-based access control",
      "Central inventory management",
      "Franchise royalty tracking",
      "Multi-brand support"
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MultiRestaurantClient />
    </>
  );
}
