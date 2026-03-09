import DigitalMenuClient from './DigitalMenuClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Digital Menu Builder for Restaurants | Online Menu Creator | DineOpen',
  description: 'Build stunning digital menus with 6 themes, 3D previews, and device-specific views. Customize with header images, categories with emojis, and real-time updates. Free online menu creator.',
  keywords: 'digital menu builder, online menu creator, restaurant menu design, digital menu card maker, online menu for restaurant, digital menu board, restaurant menu template, menu design software, digital food menu, electronic menu, interactive menu, menu customization',
  openGraph: {
    title: 'Digital Menu Builder for Restaurants | Online Menu Creator | DineOpen',
    description: 'Build stunning digital menus with 6 themes, 3D previews, and real-time updates. Start free.',
    url: 'https://www.dineopen.com/products/menu/digital-menu',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-digital-menu.jpg', width: 1200, height: 630, alt: 'DineOpen Digital Menu Builder' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Menu Builder | Online Menu Creator | DineOpen',
    description: '6 themes, 3D previews, real-time updates. Build your digital menu in minutes.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/menu/digital-menu',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function DigitalMenuPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Digital Menu Builder",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Menu Design Software",
    "description": "Build stunning digital menus with 6 themes, 3D interactive previews, device-specific views, header image customization, and real-time updates.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/menu/digital-menu",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark Plan" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "Blaze Plan" }
    ],
    "featureList": [
      "6 menu themes",
      "3D interactive previews",
      "Device-specific previews",
      "Header image customization",
      "Category management with emojis",
      "Real-time menu updates",
      "Veg/non-veg indicators",
      "Responsive design"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a digital menu builder?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A digital menu builder is software that lets you create and manage an online menu for your restaurant. Instead of printing paper menus, your customers view a beautiful, interactive menu on their phone or device. DineOpen offers 6 themes with 3D previews."
        }
      },
      {
        "@type": "Question",
        "name": "How many themes does DineOpen offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen offers 6 professionally designed themes: Default (clean modern layout), Classic (elegant traditional), Bistro (warm cafe style), Cube (grid-based visual), Book (page-turning experience), and Carousel (swipeable cards). Each theme is fully responsive."
        }
      },
      {
        "@type": "Question",
        "name": "Can I preview my menu on different devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen includes device-specific previews for mobile, tablet, and desktop. You can also view your menu in 3D interactive mode to see exactly how it looks from different angles before publishing."
        }
      },
      {
        "@type": "Question",
        "name": "Does a digital menu help with SEO?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. A digital menu with proper structure helps search engines understand your offerings. When people search for dishes you serve, your menu can appear in results. DineOpen menus are built with SEO-friendly markup."
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
      { "@type": "ListItem", "position": 4, "name": "Digital Menu Builder", "item": "https://www.dineopen.com/products/menu/digital-menu" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <DigitalMenuClient />
    </>
  );
}
