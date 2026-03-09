import ChatbotClient from './ChatbotClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Chatbot for Restaurants | Customer Support Bot | DineOpen AI',
  description: 'AI chatbot for restaurants that answers customer questions 24/7. Trained on your menu, FAQs, and policies. Upload PDFs, Word docs, or add URLs. Handles dietary questions, hours, reservations, and more.',
  keywords: 'restaurant chatbot, AI customer support restaurant, restaurant FAQ bot, menu chatbot, restaurant AI assistant, customer service bot restaurant, automated restaurant support',
  openGraph: {
    title: 'AI Chatbot for Restaurants | DineOpen AI',
    description: '24/7 AI chatbot trained on your restaurant data. Answers menu, dietary, hours, and reservation questions.',
    url: 'https://www.dineopen.com/products/ai/chatbot',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/ai/chatbot',
  },
};

export default function ChatbotPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen AI Chatbot",
    "description": "AI chatbot for restaurants trained on your own data - menu, FAQs, policies. Answers customer questions 24/7 in multiple languages.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/ai/chatbot",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "24/7 customer support",
      "Custom knowledge base",
      "FAQ management",
      "Multi-language support",
      "PDF/Word/Excel upload",
      "URL content learning"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does the restaurant chatbot work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The chatbot is trained on your restaurant's data - menu, FAQs, policies, and any documents you upload. When customers ask questions like 'Do you have vegan options?' or 'What are your hours?', the chatbot provides accurate, specific answers based on your data. It works 24/7 without human intervention."
        }
      },
      {
        "@type": "Question",
        "name": "How do I train the chatbot with my restaurant's information?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload PDF, Word, Excel, or text files containing your menu, policies, and FAQs. Add URLs for the AI to learn from. Manually add FAQ entries organized by category. The chatbot builds its knowledge from all these sources."
        }
      },
      {
        "@type": "Question",
        "name": "Can the chatbot handle dietary and allergy questions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. If your menu data includes dietary information (veg/non-veg, gluten-free, nut-free, etc.), the chatbot can answer specific questions like 'Which dishes are gluten-free?' or 'Does the pad thai contain peanuts?' accurately."
        }
      },
      {
        "@type": "Question",
        "name": "Is the chatbot available after hours?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The chatbot runs 24/7, answering questions about your menu, hours, location, reservation policies, and more - even when your restaurant is closed. This captures potential customers who research restaurants outside business hours."
        }
      },
      {
        "@type": "Question",
        "name": "Can I organize FAQs by category?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen AI Studio lets you organize FAQs by category (e.g., Menu, Reservations, Delivery, Dietary). You can add, edit, and reorder FAQ entries. The chatbot uses these organized FAQs along with uploaded documents to provide comprehensive answers."
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
      { "@type": "ListItem", "position": 4, "name": "Chatbot", "item": "https://www.dineopen.com/products/ai/chatbot" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ChatbotClient />
    </>
  );
}
