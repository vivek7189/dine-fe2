import ThemesClient from './ThemesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Menu Themes | 6 Beautiful Templates | 3D Preview | DineOpen',
  description: 'Choose from 6 stunning menu themes: Default, Classic, Bistro, Cube, Book, and Carousel. 3D interactive previews, mobile/tablet/desktop views. Free restaurant menu templates.',
  keywords: 'restaurant menu themes, menu templates, digital menu design, restaurant menu layout, menu theme customization, menu template free, restaurant menu template, QR menu design, digital menu themes, interactive menu design, 3D menu preview, mobile menu template',
  openGraph: {
    title: 'Restaurant Menu Themes | 6 Beautiful Templates | DineOpen',
    description: '6 stunning themes with 3D previews. Default, Classic, Bistro, Cube, Book, Carousel. Free templates.',
    url: 'https://www.dineopen.com/products/menu/themes',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-menu-themes.jpg', width: 1200, height: 630, alt: 'DineOpen Menu Themes' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Menu Themes | 6 Templates | DineOpen',
    description: '6 stunning themes with 3D previews. Default, Classic, Bistro, Cube, Book, Carousel.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/menu/themes',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function ThemesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Menu Themes",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Menu Design Templates",
    "description": "6 professionally designed restaurant menu themes with 3D interactive previews and device-specific views. Default, Classic, Bistro, Cube, Book, and Carousel themes.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/menu/themes",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "All themes included in Spark Plan" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "All themes included in Blaze Plan" }
    ],
    "featureList": [
      "Default theme - Clean modern layout",
      "Classic theme - Elegant traditional",
      "Bistro theme - Warm cafe style",
      "Cube theme - Grid-based visual",
      "Book theme - Page-turning experience",
      "Carousel theme - Swipeable cards",
      "3D interactive preview",
      "Mobile/tablet/desktop previews"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many menu themes does DineOpen offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen offers 6 professionally designed themes: Default, Classic, Bistro, Cube, Book, and Carousel. All themes are included in every plan at no extra cost."
        }
      },
      {
        "@type": "Question",
        "name": "Can I switch between themes after choosing one?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can switch themes at any time with a single click. Your menu content stays the same - only the visual design changes. Try different themes and see which one your customers respond to best."
        }
      },
      {
        "@type": "Question",
        "name": "What is the 3D preview feature?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The 3D preview lets you see your menu in an interactive three-dimensional view. Rotate, zoom, and explore how your menu looks from different angles. It's a unique feature that helps you make the perfect design choice."
        }
      },
      {
        "@type": "Question",
        "name": "Are the themes mobile-responsive?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all 6 themes are fully responsive. They look great on mobile phones, tablets, and desktop computers. You can preview each device size before publishing."
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
      { "@type": "ListItem", "position": 4, "name": "Menu Themes", "item": "https://www.dineopen.com/products/menu/themes" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <ThemesClient />
    </>
  );
}
