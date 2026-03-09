import InsightsClient from './InsightsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Business Insights for Restaurants | Smart Analytics | DineOpen AI',
  description: 'AI-powered business insights for restaurants. Understand customer patterns, menu performance, peak hours, and revenue trends. Actionable recommendations powered by your restaurant data.',
  keywords: 'restaurant AI insights, restaurant analytics, AI business intelligence restaurant, menu performance analytics, restaurant data insights, smart restaurant analytics, customer pattern analysis',
  openGraph: {
    title: 'AI Business Insights for Restaurants | DineOpen AI',
    description: 'AI-powered analytics and insights for smarter restaurant decisions. Menu performance, customer patterns, revenue trends.',
    url: 'https://www.dineopen.com/products/ai/insights',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/ai/insights',
  },
};

export default function InsightsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen AI Insights",
    "description": "AI-powered business insights and analytics for restaurants with customer pattern analysis, menu performance tracking, and revenue trend visualization.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/ai/insights",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Customer pattern analysis",
      "Menu performance insights",
      "Peak hour identification",
      "Revenue trend analysis",
      "AI-powered recommendations",
      "Chatbot interaction analytics"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What insights does DineOpen AI provide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen AI analyzes your order data, chatbot interactions, and customer behavior to surface insights like top-performing menu items, peak ordering hours, common customer questions, menu items frequently ordered together, and trends over time. It provides actionable recommendations, not just raw data."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI generate business recommendations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The AI analyzes patterns in your order history, customer feedback from chatbot conversations, menu performance data, and seasonal trends. It identifies opportunities like underperforming items to reconsider, popular combinations for bundling, optimal staffing hours, and menu pricing suggestions."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to set up anything for insights?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No special setup needed. DineOpen AI automatically analyzes data from your orders, chatbot interactions, and menu activity. The more you use DineOpen for ordering and customer support, the richer and more accurate the insights become."
        }
      },
      {
        "@type": "Question",
        "name": "Can I see which chatbot questions are most common?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen AI tracks every chatbot interaction and shows you the most frequently asked questions, topics that customers care about most, and questions the chatbot could not answer well. This helps you improve your FAQ and knowledge base over time."
        }
      },
      {
        "@type": "Question",
        "name": "Are insights available in real-time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Key metrics update in real-time as orders and interactions happen. Deeper trend analysis and recommendations are generated periodically to ensure accuracy. You always have access to both live metrics and strategic insights."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "AI", "item": "https://www.dineopen.com/products/ai" },
      { "@type": "ListItem", "position": 4, "name": "Insights", "item": "https://www.dineopen.com/products/ai/insights" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <InsightsClient />
    </>
  );
}
