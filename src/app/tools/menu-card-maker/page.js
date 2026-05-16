import MenuCardMakerClient from './MenuCardMakerClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Menu Card Maker [Free, No Login] — Design & Download PDF | DineOpen',
  description: 'Free restaurant menu card maker — design beautiful menus with 5 professional templates. Add items, categories, prices, pick a style, and download as PDF. Perfect for cafes, bars, restaurants. No signup needed.',
  keywords: 'restaurant menu maker, menu card maker online free, restaurant menu design, cafe menu template, menu card design, restaurant menu template free download, menu card maker, free menu maker, restaurant menu PDF, bar menu template, menu design tool, food menu maker',
  openGraph: {
    title: 'Restaurant Menu Card Maker [Free] — 5 Templates, PDF Download | DineOpen',
    description: 'Design professional restaurant menus with 5 beautiful templates. Add items, set prices, download as PDF. Free, no login.',
    url: 'https://www.dineopen.com/tools/menu-card-maker',
    siteName: 'DineOpen',
    type: 'website',
    images: [{ url: 'https://www.dineopen.com/favicon.png', width: 1200, height: 630, alt: 'DineOpen Menu Card Maker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Menu Card Maker | DineOpen',
    description: 'Design beautiful restaurant menus with professional templates. Download as PDF instantly.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/menu-card-maker',
    languages: { 'en': 'https://www.dineopen.com/tools/menu-card-maker' },
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Restaurant Menu Card Maker",
  "description": "Free online restaurant menu card maker with 5 professional templates. Design beautiful menus, add categories and items with prices, and download as PDF. No signup required.",
  "url": "https://www.dineopen.com/tools/menu-card-maker",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "5 professional menu templates",
    "PDF download",
    "Custom categories and menu items",
    "Multiple currency support",
    "Live preview",
    "No login required"
  ],
  "publisher": {
    "@type": "Organization",
    "name": "DineOpen",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.dineopen.com/favicon.png"
    }
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the ideal size for a restaurant menu card?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The most common restaurant menu sizes are: Letter (8.5\" x 11\"), Half-Letter (5.5\" x 8.5\") for compact menus, Tabloid (11\" x 17\") for large format menus, and A4 (210 x 297mm) for international restaurants. Fine dining establishments often use taller, narrower menus (4\" x 14\") for an elegant look. The best size depends on your number of items — a focused menu with fewer than 20 items looks great on a single A4 page, while larger menus may need a multi-page or folded format."
      }
    },
    {
      "@type": "Question",
      "name": "How should I design a restaurant menu to increase sales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Effective menu design uses the 'golden triangle' — customers' eyes naturally go to the top right, top left, then center of a menu. Place your highest-margin items in these spots. Use boxes, borders, or shading to highlight signature dishes. Limit items to 5-7 per category to reduce decision fatigue. Avoid currency symbols (just write '250' instead of '₹250') as studies show it reduces psychological pain of spending. Use appetizing descriptions and high-quality photos for at least your top 5 items."
      }
    },
    {
      "@type": "Question",
      "name": "Should I show currency symbols on my restaurant menu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Research from Cornell University suggests omitting currency symbols (showing '350' instead of '₹350' or '$350') can increase spending by up to 8% as it removes the psychological 'pain of paying'. However, for takeaway menus, delivery apps, or price-sensitive markets, including the currency symbol adds clarity and builds trust. A middle ground is to use the symbol only once in a header line like 'All prices in INR' and then show just numbers in the menu."
      }
    },
    {
      "@type": "Question",
      "name": "What fonts work best for restaurant menus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For elegant and fine dining menus, serif fonts like Playfair Display, Cormorant Garamond, or Georgia convey sophistication. For modern casual restaurants, clean sans-serifs like Montserrat, Lato, or Inter are highly readable. For rustic or artisanal concepts, script fonts like Pacifico or Dancing Script add character — but use them only for headings, not body text. The most important rule: body text should be at least 10-11pt, and the font must be readable under dim restaurant lighting. Avoid overly decorative fonts for item names and prices."
      }
    },
    {
      "@type": "Question",
      "name": "How often should I update my restaurant menu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most restaurants should review their menus seasonally (every 3 months) to incorporate seasonal ingredients, remove underperforming items, and adjust prices for ingredient cost changes. At minimum, do a full menu review twice a year. Fast food and QSR concepts can update more frequently — monthly or even weekly for specials. Upscale restaurants sometimes change menus daily (chef's menu) or weekly. After any major ingredient price increase (>10%), immediately review and adjust menu prices to protect your margins."
      }
    }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.dineopen.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Free Tools",
      "item": "https://www.dineopen.com/tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Menu Card Maker",
      "item": "https://www.dineopen.com/tools/menu-card-maker"
    }
  ]
};

export default function MenuCardMakerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MenuCardMakerClient />
    </>
  );
}
