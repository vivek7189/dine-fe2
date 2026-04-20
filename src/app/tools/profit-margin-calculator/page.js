import ProfitMarginCalculatorClient from './ProfitMarginCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Food Cost & Profit Margin Calculator | Restaurant Pricing | DineOpen',
  description: 'Calculate food cost percentage, profit margins, and ideal menu prices. Free calculator for restaurants, cafes & food businesses. Compare margins across multiple items. No login required.',
  keywords: 'food cost calculator, profit margin calculator, restaurant profit margin, menu pricing calculator, food cost percentage, restaurant markup calculator, how to price menu items, food business calculator, cafe profit calculator, restaurant food cost percentage, menu pricing strategy, cloud kitchen profit margin',
  openGraph: {
    title: 'Free Food Cost & Profit Margin Calculator | DineOpen',
    description: 'Calculate food cost percentage, profit margins, and ideal menu prices for your restaurant. Multi-currency, multi-item support.',
    url: 'https://www.dineopen.com/tools/profit-margin-calculator',
    siteName: 'DineOpen',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen Profit Margin Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Food Cost & Profit Margin Calculator | DineOpen',
    description: 'Calculate food cost %, profit margins, and optimal menu prices. Multi-currency support. No signup needed.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/profit-margin-calculator',
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Restaurant Profit Margin Calculator",
  "description": "Free calculator to determine food costs, profit margins, and optimal menu pricing for restaurants, cafes, cloud kitchens, and food trucks.",
  "url": "https://www.dineopen.com/tools/profit-margin-calculator",
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
      "name": "What is a good food cost percentage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A good food cost percentage typically falls between 28-35% for most restaurants. Fast food and QSR establishments aim for 25-30%, casual dining targets 28-32%, and fine dining can range from 30-35%. Cloud kitchens often achieve the best food cost at 15-25% since they have no dine-in overhead. Cafes and bakeries can reach 20-25% thanks to high-margin beverages and baked goods."
      }
    },
    {
      "@type": "Question",
      "name": "How do I calculate profit margin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Profit Margin (%) = ((Selling Price - Food Cost) / Selling Price) x 100. For example, if a dish sells for $20 and the ingredients cost $6, the profit margin is ((20 - 6) / 20) x 100 = 70%. This means 70 cents of every dollar earned is gross profit. Note that this is gross margin, not net margin -- you still need to account for labor, rent, and other operating expenses."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between margin and markup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Margin and markup both measure profitability but use different bases. Margin is profit as a percentage of the selling price: ((Price - Cost) / Price) x 100. Markup is profit as a percentage of the cost: ((Price - Cost) / Cost) x 100. For example, a dish costing $5 sold at $15 has a 66.7% margin but a 200% markup. Restaurants typically talk in terms of food cost percentage (the inverse of margin), while markup is more common in retail."
      }
    },
    {
      "@type": "Question",
      "name": "How can I lower my food costs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Key strategies to reduce food costs: (1) Negotiate with suppliers or switch to local vendors for better pricing. (2) Reduce waste through proper storage, FIFO rotation, and portion control. (3) Cross-utilize ingredients across multiple dishes to minimize spoilage. (4) Use seasonal ingredients that are cheaper and fresher. (5) Track inventory weekly to identify shrinkage. (6) Engineer your menu to promote high-margin items. (7) Standardize recipes so every cook uses the same quantities."
      }
    },
    {
      "@type": "Question",
      "name": "What profit margin should a restaurant aim for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Restaurants should aim for a gross profit margin of 65-75% on food (meaning food cost of 25-35%). However, the net profit margin after all expenses (labor, rent, utilities, marketing) is typically 5-15% for a well-run restaurant. Fast food and cloud kitchens can achieve higher net margins (10-18%) due to lower labor costs, while fine dining often operates at thinner net margins (3-9%) despite higher check averages."
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
      "name": "Profit Margin Calculator",
      "item": "https://www.dineopen.com/tools/profit-margin-calculator"
    }
  ]
};

export default function ProfitMarginCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProfitMarginCalculatorClient />
    </>
  );
}
