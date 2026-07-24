import AiLandingClient from './AiLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Agent for Restaurants | Voice Ordering & Chat | DineOpen AI',
  description: 'AI-powered restaurant assistant with voice ordering, customer chatbot, knowledge base management, and multi-language support. Upload PDFs, train your AI, customize voice settings. Works in Hindi, Tamil, Telugu, and 10+ languages.',
  keywords: 'AI restaurant assistant, voice ordering AI, restaurant chatbot, AI order taking, restaurant AI agent, voice AI restaurant, multilingual restaurant AI, AI knowledge base restaurant, smart restaurant automation',
  openGraph: {
    title: 'AI Agent for Restaurants | Voice Ordering & Chat | DineOpen AI',
    description: 'AI voice ordering, customer chatbot, and smart automation for restaurants. Multi-language support. Train with your own data.',
    url: 'https://www.dineopen.com/products/ai',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-ai.jpg', width: 1200, height: 630, alt: 'DineOpen AI Agent' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent for Restaurants | DineOpen AI',
    description: 'Voice ordering, chatbot, multi-language AI assistant for restaurants. Train with your own data.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/ai',
  },
};

export default function AiPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen AI Agent",
    "description": "AI-powered restaurant assistant with voice ordering, customer chatbot, knowledge base management, and multi-language support in Hindi, Tamil, Telugu, and 10+ languages.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/ai",
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter",
        "price": "20",
        "priceCurrency": "USD",
        "description": "$20/mo or ₹299/mo in India"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "99",
        "priceCurrency": "USD",
        "description": "$99/mo or ₹1,799/mo in India"
      }
    ],
    "featureList": [
      "AI voice ordering",
      "Customer chatbot",
      "Knowledge base management",
      "Multi-language support (10+ languages)",
      "Voice customization",
      "FAQ management",
      "PDF/Word/Excel knowledge upload",
      "URL content ingestion",
      "Greeting customization",
      "Real-time and cost-optimized voice modes"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.6",
      "reviewCount": "290"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DineOpen AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen AI is an AI-powered assistant for restaurants that handles voice ordering, answers customer questions via chatbot, and manages knowledge bases. You train it with your own data (PDFs, documents, FAQs, URLs) and it works in Hindi, Tamil, Telugu, and 10+ languages."
        }
      },
      {
        "@type": "Question",
        "name": "How does AI voice ordering work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers speak their order naturally - 'I want two butter chickens and three naans' - and the AI understands, confirms, and places the order. It handles modifiers, special requests, and multi-item orders. Works in multiple languages including Hindi and regional Indian languages."
        }
      },
      {
        "@type": "Question",
        "name": "What languages does DineOpen AI support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen AI supports Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more. Customers can speak in their preferred language, and the AI responds in the same language."
        }
      },
      {
        "@type": "Question",
        "name": "How do I train the AI with my restaurant's data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload PDF, Word, Excel, or text files containing your menu, policies, and FAQs. You can also add URLs for the AI to learn from, and manually add FAQ entries organized by category. The AI builds a knowledge base from all these sources to answer customer questions accurately."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize the AI voice?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen AI Studio lets you select different voice options, choose between realtime and cost-optimized voice modes, customize the greeting message, and configure response behavior. You control how the AI sounds and behaves."
        }
      },
      {
        "@type": "Question",
        "name": "Is the AI chatbot available 24/7?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The AI chatbot runs 24/7 answering customer questions about your menu, hours, dietary options, reservations, and more. It uses your uploaded knowledge base to provide accurate, restaurant-specific answers even outside business hours."
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
      { "@type": "ListItem", "position": 3, "name": "AI", "item": "https://www.dineopen.com/products/ai" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AiLandingClient />
    </>
  );
}
