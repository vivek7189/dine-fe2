import ManagementClient from './ManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Menu Management Software | Item CRUD, Categories & Bulk Upload | DineOpen',
  description: 'Manage your restaurant menu with ease. Add, edit, delete items. Organize with categories and emojis. Veg/non-veg indicators, bulk upload, availability toggle, short codes, and pricing management.',
  keywords: 'menu management software, restaurant menu management, menu item management, restaurant menu editor, menu category management, bulk menu upload, menu availability, menu pricing tool, restaurant menu organizer, food menu manager, menu CRUD, menu short codes',
  openGraph: {
    title: 'Restaurant Menu Management Software | DineOpen',
    description: 'Manage menu items, categories, pricing, and availability. Bulk upload, veg/non-veg indicators, short codes. Start free.',
    url: 'https://www.dineopen.com/products/menu/management',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-menu-management.jpg', width: 1200, height: 630, alt: 'DineOpen Menu Management' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Menu Management Software | DineOpen',
    description: 'Manage items, categories, pricing, availability. Bulk upload, short codes. Start free.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/menu/management',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function ManagementPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Menu Management",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Menu Management Software",
    "description": "Complete menu management system with item CRUD, categories, veg/non-veg indicators, bulk upload, pricing, availability toggle, and short codes.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/menu/management",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark Plan" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "Blaze Plan" }
    ],
    "featureList": [
      "Menu item CRUD operations",
      "Category management with emojis",
      "Veg/non-veg indicators",
      "Bulk menu upload",
      "Pricing management",
      "Availability toggle",
      "Short codes for quick ordering",
      "Image management with carousel",
      "Favorite items marking",
      "Grid and list view modes"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I add menu items in DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click Add Item, enter the name, price, category, and description. Upload an image, set veg/non-veg status, and optionally add a short code. You can also bulk upload items from a spreadsheet."
        }
      },
      {
        "@type": "Question",
        "name": "Can I organize my menu into categories?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Create unlimited categories like Starters, Main Course, Desserts, Beverages, etc. Each category can have an emoji for visual identification. Drag and drop to reorder categories."
        }
      },
      {
        "@type": "Question",
        "name": "What are short codes in DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Short codes are quick identifiers for menu items. Assign codes like B1 for Butter Chicken or D5 for Dal Makhani. Staff and customers can use these codes for faster ordering at the POS or counter."
        }
      },
      {
        "@type": "Question",
        "name": "How does the availability toggle work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Toggle any item's availability with a single click. When an item is unavailable, it appears grayed out or hidden on the customer menu. Toggle it back when the item is available again. No need to delete and re-add items."
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
      { "@type": "ListItem", "position": 4, "name": "Menu Management", "item": "https://www.dineopen.com/products/menu/management" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <ManagementClient />
    </>
  );
}
