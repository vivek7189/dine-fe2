import VoiceOrderingClient from './VoiceOrderingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Voice Ordering for Restaurants | Speak to Order | DineOpen AI',
  description: 'AI voice ordering for restaurants. Customers speak their order naturally in Hindi, Tamil, Telugu, English, and 10+ languages. Handles modifiers, special requests, and multi-item orders. No training needed by customers.',
  keywords: 'AI voice ordering, voice order restaurant, speak to order, AI food ordering, voice AI restaurant, multilingual voice ordering, Hindi voice ordering, automated order taking',
  openGraph: {
    title: 'AI Voice Ordering for Restaurants | DineOpen AI',
    description: 'Customers speak their order in any language. AI understands and processes it. 10+ languages supported.',
    url: 'https://www.dineopen.com/products/ai/voice-ordering',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/ai/voice-ordering',
  },
};

export default function VoiceOrderingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen AI Voice Ordering",
    "description": "AI-powered voice ordering system for restaurants supporting Hindi, Tamil, Telugu, English, and 10+ languages.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/ai/voice-ordering",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Natural language voice ordering",
      "10+ language support",
      "Modifier handling",
      "Special request processing",
      "Multi-item orders",
      "Voice confirmation",
      "Realtime and cost-optimized modes"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does AI voice ordering work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Customers speak their order naturally, like talking to a waiter. For example: 'I want two butter chickens, extra spicy, and three garlic naans.' The AI understands the items, quantities, modifiers, and special requests, confirms the order, and places it into your system."
        }
      },
      {
        "@type": "Question",
        "name": "What languages are supported for voice ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen AI supports voice ordering in Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, English, and more. Customers speak in their preferred language and the AI responds in the same language."
        }
      },
      {
        "@type": "Question",
        "name": "Can the AI handle complex orders with modifiers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The AI handles modifiers like 'extra cheese', 'no onions', 'medium spicy', size variants, and special cooking instructions. It can process multiple items with different modifiers in a single conversational order."
        }
      },
      {
        "@type": "Question",
        "name": "What are realtime vs cost-optimized voice modes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Realtime mode provides the fastest, most natural conversational experience with minimal latency. Cost-optimized mode uses a more efficient processing pipeline that costs less per interaction while still providing accurate ordering. Choose based on your budget and customer experience needs."
        }
      },
      {
        "@type": "Question",
        "name": "Do customers need to install anything for voice ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No installation needed. Voice ordering works through the web browser. Customers simply click the microphone button on your ordering page or call your restaurant's AI-enabled phone number to start ordering by voice."
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
      { "@type": "ListItem", "position": 4, "name": "Voice Ordering", "item": "https://www.dineopen.com/products/ai/voice-ordering" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <VoiceOrderingClient />
    </>
  );
}
