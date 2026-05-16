import CalorieCalculatorClient from './CalorieCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Menu Nutrition & Calorie Calculator [Free] — FDA & FSSAI Labels | DineOpen',
  description: 'Free nutrition and calorie calculator for restaurant menu items. Calculate calories, protein, carbs, fat, and fiber per serving. Generate FDA Nutrition Facts and FSSAI nutrition labels instantly. Add ingredients from our database of 80+ common foods or use AI to analyze any dish.',
  keywords: 'food calorie calculator, nutrition calculator, restaurant menu calorie count, FSSAI nutrition label generator, FDA nutrition facts, calorie counter for recipes, nutrition information restaurant, menu nutrition calculator',
  openGraph: {
    title: 'Menu Nutrition & Calorie Calculator [Free] — FDA & FSSAI Labels | DineOpen',
    description: 'Calculate calories, protein, carbs, fat, and fiber for any menu item. Generate FDA and FSSAI compliant nutrition labels instantly. Free, no login required.',
    url: 'https://www.dineopen.com/tools/calorie-calculator',
    siteName: 'DineOpen',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen Calorie & Nutrition Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menu Nutrition & Calorie Calculator [Free] — FDA & FSSAI Labels | DineOpen',
    description: 'Calculate nutrition facts for your restaurant menu items. Generate FDA and FSSAI labels. Free, no signup needed.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/calorie-calculator',
    languages: {
      'en': 'https://www.dineopen.com/tools/calorie-calculator',
      'hi': 'https://www.dineopen.com/hi/tools/calorie-calculator',
    },
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DineOpen Menu Nutrition & Calorie Calculator",
  "description": "Free restaurant menu nutrition and calorie calculator. Add ingredients from an 80+ item database, calculate total calories, protein, carbs, fat and fiber per serving, and generate FDA or FSSAI compliant nutrition labels.",
  "url": "https://www.dineopen.com/tools/calorie-calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
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
      "name": "How do you calculate calories in a restaurant dish?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To calculate calories in a restaurant dish, list every ingredient with its quantity in grams, look up the calories per 100g for each ingredient, calculate each ingredient's calorie contribution (calories per 100g × quantity used / 100), then sum all values. For example, 150g of chicken breast (165 kcal/100g) contributes 247.5 kcal. Our calculator automates this process with a built-in database of 80+ common restaurant ingredients."
      }
    },
    {
      "@type": "Question",
      "name": "Is FSSAI nutrition labeling mandatory for restaurants in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Under FSSAI (Food Safety and Standards Authority of India) regulations, nutrition labeling is mandatory for packaged food products. For restaurants, the FSSAI has introduced menu labeling guidelines that require displaying calorie information on menus, particularly for chains with 10 or more outlets. FSSAI mandates displaying energy (kcal), protein, carbohydrates, and fat values per serving on menus. Complying proactively builds consumer trust even for smaller restaurants."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between FDA and FSSAI nutrition label formats?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The FDA (US) Nutrition Facts label lists: serving size, calories, total fat, saturated fat, trans fat, cholesterol, sodium, total carbohydrate, dietary fiber, total sugars, added sugars, and protein. The FSSAI (India) label format lists: energy (kcal), protein, carbohydrates (with sugars), fat (with saturated fat), and may include dietary fiber and sodium. The FDA label uses % Daily Values based on a 2,000 calorie diet, while FSSAI uses reference daily intakes (RDI) specific to Indian dietary standards."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is a calorie calculator for restaurant food?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A calorie calculator is most accurate when you input precise ingredient quantities from your standardized recipe cards. Accuracy depends on: (1) using exact gram weights rather than approximations, (2) accounting for all ingredients including oils, sauces, and garnishes, and (3) using reliable nutrition data. Our calculator uses USDA-validated nutrition values per 100g for each ingredient. Cooking methods can affect final calorie counts slightly — deep frying adds oil absorption of approximately 10-15% of the food weight."
      }
    },
    {
      "@type": "Question",
      "name": "Why should restaurants display calorie counts on their menus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Restaurants that display calorie counts on menus benefit in several ways: (1) Legal compliance — FSSAI regulations and FDA menu labeling rules (for chains with 20+ US locations) require it. (2) Consumer trust — health-conscious diners actively seek nutrition information and prefer transparent restaurants. (3) Competitive advantage — displaying nutrition data differentiates your brand in an increasingly health-aware market. (4) Operational discipline — calculating nutrition forces you to standardize recipes, which also controls food costs and portion sizes."
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
      "name": "Calorie Calculator",
      "item": "https://www.dineopen.com/tools/calorie-calculator"
    }
  ]
};

export default function CalorieCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CalorieCalculatorClient />
    </>
  );
}
