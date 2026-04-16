import FoodCostCalculatorClient from './FoodCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Food Cost Calculator [Free, No Login] — Instant Results | DineOpen',
  description: 'Free restaurant food cost calculator — per-recipe ingredient breakdown, ideal selling price, food cost % & profit margins in seconds. Add multiple ingredients, convert units, and get detailed cost analysis. No login, no signup.',
  keywords: 'restaurant food cost calculator, food cost percentage calculator, recipe cost calculator, ingredient cost calculator, food cost formula, menu costing tool, restaurant profit calculator, food cost percentage, how to calculate food cost, restaurant pricing calculator, food cost calculator online free',
  openGraph: {
    title: 'Restaurant Food Cost Calculator [Free] — Per-Ingredient Breakdown | DineOpen',
    description: 'Calculate food cost % with per-ingredient breakdown, unit conversion, and detailed profit analysis. Free, no login required.',
    url: 'https://www.dineopen.com/tools/food-cost-calculator',
    siteName: 'DineOpen',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen Food Cost Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Food Cost Calculator [Free, No Login] | DineOpen',
    description: 'Calculate food cost % with per-ingredient breakdown and ideal menu pricing instantly. No signup needed.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/food-cost-calculator',
    languages: {
      'en': 'https://www.dineopen.com/tools/food-cost-calculator',
      'hi': 'https://www.dineopen.com/hi/tools/food-cost-calculator',
    },
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DineOpen Food Cost Calculator",
  "description": "Free restaurant food cost calculator with per-ingredient breakdown. Calculate food cost percentage, profit margins, and ideal menu pricing instantly.",
  "url": "https://www.dineopen.com/tools/food-cost-calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
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
      "name": "What is a good food cost percentage for a restaurant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A good food cost percentage for most restaurants is between 28-35%. Quick service restaurants (QSR) should aim for 25-30%, casual dining for 28-32%, fine dining for 30-35%, and cloud kitchens for 25-28%. Bakeries and cafes can achieve 20-25% due to high-margin beverages."
      }
    },
    {
      "@type": "Question",
      "name": "How do you calculate food cost percentage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Food Cost Percentage = (Total Ingredient Cost ÷ Selling Price) × 100. For example, if a dish costs ₹80 in ingredients and sells for ₹250, the food cost percentage is (80 ÷ 250) × 100 = 32%. For recipes that yield multiple portions, divide the total recipe cost by the number of portions first to get cost per portion."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between food cost and food cost percentage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Food cost is the absolute rupee amount spent on ingredients (e.g., ₹80). Food cost percentage is the ratio of ingredient cost to selling price expressed as a percentage (e.g., 32%). The percentage is more useful because it allows comparison across dishes of different price points and benchmarking against industry standards."
      }
    },
    {
      "@type": "Question",
      "name": "How often should I calculate food cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You should calculate food cost at least weekly for your top-selling items and monthly for your entire menu. Ingredient prices fluctuate frequently in India, especially for vegetables, dairy, and poultry. Regular calculation helps you catch rising costs early and adjust pricing or portions before they erode your profits significantly."
      }
    },
    {
      "@type": "Question",
      "name": "What causes food cost to be too high?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Common causes of high food cost include: inconsistent portioning by kitchen staff, food waste and spoilage, theft, not tracking inventory properly, paying too much to suppliers, menu items priced too low, and not accounting for all ingredients (including oil, spices, garnishes). Using standardized recipes and proper inventory management can reduce food cost by 5-10%."
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
      "name": "Food Cost Calculator",
      "item": "https://www.dineopen.com/tools/food-cost-calculator"
    }
  ]
};

export default function FoodCostCalculatorPage() {
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
      <FoodCostCalculatorClient />
    </>
  );
}
