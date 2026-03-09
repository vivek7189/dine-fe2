import OnlineMenuClient from './OnlineMenuClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Online Menu for Restaurants | Share Your Menu Online | DineOpen Menu',
  description: 'Create and share your restaurant menu online with DineOpen. Customers can browse your menu from any device, view item details, prices, and photos. Auto-sync with your POS. Free trial.',
  keywords: 'online menu for restaurant, restaurant menu online, digital restaurant menu, share menu online, restaurant menu website, online food menu',
  openGraph: {
    title: 'Online Menu for Restaurants | DineOpen Menu',
    description: 'Share your restaurant menu online. Customers browse from any device with real-time pricing and availability.',
    url: 'https://www.dineopen.com/products/menu/online-menu',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Restaurant Menu | DineOpen Menu',
    description: 'Share your restaurant menu online with real-time updates and beautiful themes.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/menu/online-menu',
  },
};

export default function OnlineMenuPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Online Menu",
    "description": "Create and share your restaurant menu online with real-time sync to your POS system.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "brand": { "@type": "Brand", "name": "DineOpen" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I share my restaurant menu online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With DineOpen Menu, simply add your menu items, choose a theme, and you get a shareable online menu link. Share it on social media, Google My Business, your website, or anywhere. Your menu auto-syncs with your POS so prices and availability are always up to date."
        }
      },
      {
        "@type": "Question",
        "name": "Can customers order directly from the online menu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! DineOpen online menus can be connected to the ordering system. Customers can browse your menu, add items to cart, and place orders directly. Orders appear in your POS in real-time."
        }
      },
      {
        "@type": "Question",
        "name": "Does the online menu update automatically?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. When you update prices, add new items, or mark items as unavailable in DineOpen, your online menu updates in real-time. No need to manually update a separate website."
        }
      },
      {
        "@type": "Question",
        "name": "Is the online menu mobile-friendly?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. DineOpen online menus are fully responsive and look great on phones, tablets, and desktops. Most customers will browse on their phones, so mobile-first design is built in."
        }
      },
      {
        "@type": "Question",
        "name": "Can I put my online menu on Google My Business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Copy your DineOpen menu link and add it to your Google My Business listing under the menu URL field. This helps customers see your menu directly from Google Search and Maps."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "DineOpen Menu", "item": "https://www.dineopen.com/products/menu" },
      { "@type": "ListItem", "position": 4, "name": "Online Menu", "item": "https://www.dineopen.com/products/menu/online-menu" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <OnlineMenuClient />
    </>
  );
}
