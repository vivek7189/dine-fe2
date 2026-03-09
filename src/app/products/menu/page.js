import MenuLandingClient from './MenuLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Digital Menu Builder for Restaurants | QR Menu Maker | DineOpen Menu',
  description: 'Create beautiful digital menus with QR codes for your restaurant. 6 stunning themes, 3D previews, bulk upload, veg/non-veg indicators. No printing costs. Start free with DineOpen Menu.',
  keywords: 'digital menu builder, QR menu for restaurant, restaurant menu maker, QR code menu, online menu creator, digital menu card, restaurant menu software, contactless menu, menu QR code generator, menu management software, restaurant menu app, digital menu board, free menu maker, menu design tool, DineOpen menu',
  openGraph: {
    title: 'Digital Menu Builder for Restaurants | QR Menu Maker | DineOpen Menu',
    description: 'Create stunning digital menus in minutes. 6 themes, QR codes, 3D previews, bulk upload. Zero printing costs. Start free.',
    url: 'https://www.dineopen.com/products/menu',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-menu.jpg', width: 1200, height: 630, alt: 'DineOpen Digital Menu Builder' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Menu Builder for Restaurants | DineOpen Menu',
    description: 'Create stunning digital menus with QR codes. 6 themes, 3D previews, bulk upload. Start free.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/menu',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function MenuPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Menu - Digital Menu Builder",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Menu Software",
    "description": "Create beautiful digital menus with QR codes for restaurants. 6 stunning themes, 3D previews, bulk upload, veg/non-veg indicators, and category management.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/menu",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free — Create your digital menu at no cost"
    },
    "featureList": [
      "QR code menu generation",
      "6 menu themes (Default, Classic, Bistro, Cube, Book, Carousel)",
      "3D interactive menu previews",
      "Device-specific previews",
      "Bulk menu upload",
      "Veg/non-veg indicators",
      "Category management with emojis",
      "Header image customization",
      "Short codes for quick ordering",
      "Availability toggle per item"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "480"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create a digital menu for my restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sign up for DineOpen, add your menu items with prices and images, choose from 6 beautiful themes, and generate a QR code. Your digital menu is live in minutes. You can also bulk upload items from a spreadsheet."
        }
      },
      {
        "@type": "Question",
        "name": "How does a QR code menu work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers scan the QR code with their phone camera. Your digital menu opens instantly in their browser - no app download needed. They can browse categories, see images, check veg/non-veg indicators, and place orders directly."
        }
      },
      {
        "@type": "Question",
        "name": "What menu themes are available in DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen offers 6 professionally designed menu themes: Default (clean and modern), Classic (elegant and traditional), Bistro (warm cafe style), Cube (grid-based visual), Book (page-turning experience), and Carousel (swipeable card layout). All themes are mobile-responsive."
        }
      },
      {
        "@type": "Question",
        "name": "Is DineOpen Menu really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! DineOpen Menu is completely free to use. Create your digital menu, generate QR codes, share online — all at no cost. No hidden fees, no transaction charges."
        }
      },
      {
        "@type": "Question",
        "name": "Can I add veg and non-veg indicators to my menu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen includes built-in veg/non-veg indicators for every menu item. Green dot for vegetarian, red dot for non-vegetarian - following the standard Indian food labeling system. This helps customers quickly identify suitable dishes."
        }
      },
      {
        "@type": "Question",
        "name": "Can I upload my entire menu at once?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports bulk menu upload. Prepare your items in a spreadsheet with columns for name, price, category, and description, then upload it all at once. This is much faster than adding items one by one."
        }
      },
      {
        "@type": "Question",
        "name": "Is the QR code menu free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, QR menu generation is completely free with DineOpen. There are no charges for QR code generation, menu hosting, or customer views. Zero transaction fees on orders placed through the menu."
        }
      },
      {
        "@type": "Question",
        "name": "How is DineOpen Menu different from Menubly or MenuDrive?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Menu offers 6 unique themes including 3D interactive previews, built-in POS integration, veg/non-veg indicators, and bulk upload - all in one platform. Unlike standalone menu tools, DineOpen includes billing, orders, loyalty, and AI features at no extra cost."
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
      { "@type": "ListItem", "position": 3, "name": "DineOpen Menu", "item": "https://www.dineopen.com/products/menu" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <MenuLandingClient />
    </>
  );
}
