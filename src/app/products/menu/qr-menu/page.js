import QrMenuClient from './QrMenuClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'QR Menu for Restaurants | QR Code Menu Maker | DineOpen',
  description: 'Create QR code menus for your restaurant. Contactless, always updated, no printing costs. Customers scan and browse your menu instantly. Free QR menu maker with DineOpen.',
  keywords: 'QR menu for restaurant, QR code menu maker, contactless menu, QR menu generator, digital QR menu, restaurant QR code, scan to order menu, QR menu card, free QR menu, touchless menu, QR code food menu, mobile menu QR',
  openGraph: {
    title: 'QR Menu for Restaurants | QR Code Menu Maker | DineOpen',
    description: 'Create QR code menus. Customers scan and browse instantly. Contactless, always updated, no printing costs.',
    url: 'https://www.dineopen.com/products/menu/qr-menu',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-qr-menu.jpg', width: 1200, height: 630, alt: 'DineOpen QR Menu Maker' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Menu for Restaurants | DineOpen',
    description: 'Create QR code menus. Contactless, always updated, no printing costs. Start free.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/menu/qr-menu',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function QrMenuPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen QR Menu Maker",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "QR Code Menu Generator",
    "description": "Create QR code menus for restaurants. Contactless ordering, always updated, zero printing costs. Customers scan and browse instantly.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/menu/qr-menu",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark Plan - includes QR menu" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "Blaze Plan - includes QR menu" }
    ],
    "featureList": [
      "QR code generation",
      "Contactless menu viewing",
      "Real-time menu updates",
      "Multi-device support",
      "No app download required",
      "Custom QR code design",
      "Analytics and tracking"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create a QR code menu for my restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sign up for DineOpen, add your menu items with prices and images, and click Generate QR Code. Your QR menu is ready to print and display. The entire process takes less than 10 minutes."
        }
      },
      {
        "@type": "Question",
        "name": "Do customers need to download an app to view the QR menu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No app download is required. Customers simply scan the QR code with their phone camera, and the menu opens directly in their browser. Works on all smartphones."
        }
      },
      {
        "@type": "Question",
        "name": "Can I update my QR menu without reprinting QR codes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, your QR code is permanent. Any changes to menu items, prices, or availability reflect instantly. You never need to reprint QR codes."
        }
      },
      {
        "@type": "Question",
        "name": "Is a QR code menu free with DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "QR menu generation is included in all DineOpen plans starting at $9.99/month (Rs 300/month in India). No extra charges for QR codes, hosting, or customer views."
        }
      }
    ]
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "DineOpen Menu", "item": "https://www.dineopen.com/products/menu" },
      { "@type": "ListItem", "position": 4, "name": "QR Menu", "item": "https://www.dineopen.com/products/menu/qr-menu" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <QrMenuClient />
    </>
  );
}
