import CustomerAppClient from './CustomerAppClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Branded Restaurant Customer App - Crave | DineOpen',
  description: 'Get a branded customer-facing app for your restaurant. Crave lets customers browse menus, place orders, track loyalty points, and receive promotional offers. Build direct relationships without third-party platforms.',
  keywords: 'restaurant customer app, branded restaurant app, white label restaurant app, Crave app, restaurant ordering app, customer engagement app, loyalty app restaurant, restaurant mobile app',
  openGraph: {
    title: 'Branded Restaurant Customer App - Crave | DineOpen',
    description: 'Your own branded customer app. Menu, ordering, loyalty points, and offers in one place.',
    url: 'https://www.dineopen.com/products/loyalty/customer-app',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Branded Restaurant Customer App - Crave | DineOpen',
    description: 'Branded customer app with menu, ordering, loyalty, and offers.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty/customer-app',
  },
};

export default function CustomerAppPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Crave - Restaurant Customer App by DineOpen",
    "applicationCategory": "FoodEstablishment",
    "applicationSubCategory": "Restaurant Customer App",
    "description": "Branded customer-facing app for restaurants. Customers browse menus, place orders, track loyalty points, and receive promotional offers.",
    "operatingSystem": "iOS, Android, Web",
    "url": "https://www.dineopen.com/products/loyalty/customer-app",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Included with Spark Plan" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Included with Spark Plan India" }
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Crave?",
        "acceptedAnswer": { "@type": "Answer", "text": "Crave is a branded customer-facing app included with DineOpen. It lets your restaurant's customers browse your menu, place orders for dine-in or delivery, track their loyalty points, redeem rewards, and receive promotional offers. It's your direct channel to customers without relying on third-party delivery platforms." }
      },
      {
        "@type": "Question",
        "name": "Is Crave a separate app or part of DineOpen?",
        "acceptedAnswer": { "@type": "Answer", "text": "Crave is a customer-facing app that's separate from the DineOpen restaurant management dashboard. Your restaurant manages everything from DineOpen, while your customers interact with Crave. The two sync in real time - menu changes, offers, and loyalty points update instantly." }
      },
      {
        "@type": "Question",
        "name": "Do my customers need to download an app?",
        "acceptedAnswer": { "@type": "Answer", "text": "Crave is available as both a downloadable mobile app and a web app. Customers can access it by scanning a QR code without downloading anything, or they can install it for a native app experience with push notifications." }
      },
      {
        "@type": "Question",
        "name": "Does Crave charge commission on orders?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. Unlike Zomato or Swiggy which charge 25-35% commission per order, Crave has zero commission fees. Orders placed through Crave go directly to your kitchen with no middleman and no transaction charges." }
      }
    ]
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "DineOpen Loyalty", "item": "https://www.dineopen.com/products/loyalty" },
      { "@type": "ListItem", "position": 4, "name": "Customer App", "item": "https://www.dineopen.com/products/loyalty/customer-app" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <CustomerAppClient />
    </>
  );
}
