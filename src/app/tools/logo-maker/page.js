import LogoMakerClient from './LogoMakerClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Logo Maker [Free, No Login] — Instant Logo Design | DineOpen',
  description: 'Free restaurant logo maker — create professional logos instantly with 8 beautiful templates. Choose your cuisine, style, and colors, then download your logo as SVG. Perfect for cafes, bars, restaurants & food businesses. No signup needed.',
  keywords: 'restaurant logo maker free, cafe logo design online, food logo generator, restaurant logo ideas, restaurant logo template, cafe logo maker, bar logo design, restaurant branding, food logo design free, restaurant logo creator',
  openGraph: {
    title: 'Restaurant Logo Maker [Free] — 8 Templates, Instant Download | DineOpen',
    description: 'Design a professional restaurant logo in minutes. 8 unique templates, custom colors, instant SVG download. Free, no login required.',
    url: 'https://www.dineopen.com/tools/logo-maker',
    siteName: 'DineOpen',
    type: 'website',
    images: [{ url: 'https://www.dineopen.com/favicon.png', width: 1200, height: 630, alt: 'DineOpen Restaurant Logo Maker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Logo Maker | DineOpen',
    description: 'Create professional restaurant logos instantly. 8 templates, custom colors, free SVG download.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/logo-maker',
    languages: { 'en': 'https://www.dineopen.com/tools/logo-maker' },
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Restaurant Logo Maker",
  "description": "Free online restaurant logo maker with 8 professional templates. Design a beautiful logo for your restaurant, cafe, or bar. Customize colors, style, and cuisine type, then download as SVG. No signup required.",
  "url": "https://www.dineopen.com/tools/logo-maker",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "8 professional logo templates",
    "SVG download",
    "Custom color selection",
    "Cuisine-specific icons",
    "Multiple style options",
    "AI tagline suggestions",
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
      "name": "What makes a good restaurant logo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A good restaurant logo is memorable, scalable, and communicates your brand's personality at a glance. It should work in both color and black-and-white, be readable at small sizes (like on a menu or receipt), and reflect your cuisine type and dining atmosphere. The best restaurant logos use a maximum of 2-3 colors, a clean typeface that matches the brand vibe, and a simple icon or emblem. Avoid overly complex designs — the most iconic logos (think the golden arches or the Starbucks siren) are simple and instantly recognizable."
      }
    },
    {
      "@type": "Question",
      "name": "What colors work best for restaurant logos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Color psychology plays a big role in restaurant branding. Red and orange stimulate appetite and create urgency — ideal for fast food and casual dining. Green signals freshness, health, and sustainability — great for vegan, farm-to-table, or salad concepts. Gold and deep burgundy convey luxury and refinement — perfect for fine dining. Blue is rarely used in food businesses as it can suppress appetite, but works for seafood or tech-forward brands. Black communicates sophistication and is popular for premium steakhouses and modern restaurants. Always consider your target customer when choosing colors."
      }
    },
    {
      "@type": "Question",
      "name": "Should my logo include food imagery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Food imagery in logos can quickly communicate your cuisine type and is popular for ethnic restaurants, specialty food businesses, and cafes. However, overly literal food illustrations can feel dated or limit your brand's versatility. Many successful restaurants opt for abstract symbols, lettermarks, or elegant typography instead. If you do use food imagery, choose a stylized or geometric interpretation rather than a realistic illustration — it scales better and ages more gracefully. Our logo maker offers cuisine-specific icons that strike this balance well."
      }
    },
    {
      "@type": "Question",
      "name": "How much does a professional restaurant logo cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Professional restaurant logo design costs vary widely: a freelance designer on Fiverr might charge ₹2,000–₹15,000 ($25–$200), a mid-level graphic designer typically charges ₹15,000–₹75,000 ($200–$1,000), and a professional branding agency can charge ₹75,000–₹5,00,000+ ($1,000–$6,000+). For early-stage restaurants, startups, and food entrepreneurs, free online tools like DineOpen's Logo Maker provide a professional starting point at zero cost. Many restaurateurs use free tools for launch and invest in professional branding once the business is established."
      }
    },
    {
      "@type": "Question",
      "name": "Can I trademark a logo made with this tool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can attempt to trademark a logo created with this tool, as the designs are generated based on your unique combination of name, colors, and style. However, trademark eligibility depends on distinctiveness and whether a similar mark already exists. Before filing a trademark application, conduct a thorough trademark search on the USPTO (US) or IP India database. Consult a trademark attorney for guidance — the cost of a trademark application in India ranges from ₹4,500–₹9,000 per class, while in the US it's $250–$350 per class. Trademarking your logo protects your brand identity and prevents competitors from using similar designs."
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
      "name": "Restaurant Logo Maker",
      "item": "https://www.dineopen.com/tools/logo-maker"
    }
  ]
};

export default function LogoMakerPage() {
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
      <LogoMakerClient />
    </>
  );
}
