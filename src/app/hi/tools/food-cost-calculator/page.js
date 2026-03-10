import FoodCostCalculatorClient from './FoodCostCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'रेस्टोरेंट फूड कॉस्ट कैलकुलेटर [Free, No Login] — तुरंत Result | DineOpen',
  description: 'Free restaurant food cost calculator हिंदी में — food cost %, profit margin, और ideal menu pricing तुरंत calculate करें। हर ingredient की detail, unit conversion, और cost breakdown। No login, no signup।',
  keywords: 'food cost calculator hindi, restaurant food cost calculator, फूड कॉस्ट कैलकुलेटर, food cost percentage calculator, recipe cost calculator hindi, menu costing tool, food cost formula hindi, restaurant pricing calculator, food cost kaise calculate kare',
  openGraph: {
    title: 'रेस्टोरेंट फूड कॉस्ट कैलकुलेटर [Free] — Ingredient-wise Breakdown | DineOpen',
    description: 'हर ingredient की cost, unit conversion, और profit analysis — Free, no login।',
    url: 'https://www.dineopen.com/hi/tools/food-cost-calculator',
    siteName: 'DineOpen',
    locale: 'hi_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen फूड कॉस्ट कैलकुलेटर',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'रेस्टोरेंट फूड कॉस्ट कैलकुलेटर [Free, No Login] | DineOpen',
    description: 'Ingredient-wise food cost % और ideal menu pricing तुरंत calculate करें।',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/hi/tools/food-cost-calculator',
    languages: {
      'en': 'https://www.dineopen.com/tools/food-cost-calculator',
      'hi': 'https://www.dineopen.com/hi/tools/food-cost-calculator',
    },
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DineOpen फूड कॉस्ट कैलकुलेटर",
  "description": "Free restaurant food cost calculator हिंदी में। हर ingredient की cost, food cost percentage, profit margin, और ideal menu pricing तुरंत calculate करें।",
  "url": "https://www.dineopen.com/hi/tools/food-cost-calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "inLanguage": "hi",
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
      "name": "Restaurant के लिए अच्छा food cost percentage कितना होना चाहिए?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ज़्यादातर restaurants के लिए 28-35% food cost percentage अच्छा माना जाता है। QSR के लिए 25-30%, casual dining के लिए 28-32%, fine dining के लिए 30-35%, और cloud kitchen के लिए 25-28% ideal है। Bakery और cafe में beverages की high margin होने से 20-25% achieve किया जा सकता है।"
      }
    },
    {
      "@type": "Question",
      "name": "Food cost percentage कैसे calculate करें?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Food Cost Percentage = (Total Ingredient Cost ÷ Selling Price) × 100। उदाहरण: अगर एक dish बनाने में ₹80 लगते हैं और selling price ₹250 है, तो food cost percentage = (80 ÷ 250) × 100 = 32%। अगर recipe से कई portions बनते हैं, तो पहले total cost को portions से divide करके per portion cost निकालें।"
      }
    },
    {
      "@type": "Question",
      "name": "Food cost और food cost percentage में क्या फर्क है?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Food cost वो actual rupee amount है जो ingredients पर खर्च होती है (जैसे ₹80)। Food cost percentage ingredient cost और selling price का ratio है percentage में (जैसे 32%)। Percentage ज़्यादा useful है क्योंकि इससे अलग-अलग price वाले dishes की comparison हो सकती है और industry benchmarks से match किया जा सकता है।"
      }
    },
    {
      "@type": "Question",
      "name": "Food cost कितनी बार calculate करनी चाहिए?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Top-selling items के लिए हफ्ते में एक बार और पूरे menu के लिए महीने में एक बार food cost calculate करनी चाहिए। India में vegetables, dairy, और poultry की prices बहुत fluctuate करती हैं। Regular calculation से आप rising costs को जल्दी पकड़ सकते हैं और pricing या portions adjust कर सकते हैं।"
      }
    },
    {
      "@type": "Question",
      "name": "Food cost ज़्यादा क्यों होती है?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "High food cost के common कारण: kitchen staff द्वारा inconsistent portioning, food waste और spoilage, theft, inventory properly track न करना, suppliers को ज़्यादा pay करना, menu items की pricing बहुत कम रखना, और सभी ingredients (oil, spices, garnishes) को account न करना। Standardized recipes और proper inventory management से food cost 5-10% कम हो सकती है।"
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
      "name": "फूड कॉस्ट कैलकुलेटर",
      "item": "https://www.dineopen.com/hi/tools/food-cost-calculator"
    }
  ]
};

export default function HindiFoodCostCalculatorPage() {
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
