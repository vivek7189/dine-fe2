export default function SEOStructuredData() {
  const baseUrl = 'https://www.dineopen.com';
  const currentDate = new Date().toISOString();

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DineOpen",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.png`,
    "description": "AI-powered restaurant POS and billing software with voice ordering, QR menus, GST billing. Affordable Square, Toast & Petpooja alternative for restaurants in USA, UK & India.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@dineopen.com",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      "https://twitter.com/dineopen",
      "https://www.linkedin.com/company/dineopen",
      "https://www.facebook.com/dineopen"
    ],
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "India" }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    }
  };

  // SoftwareApplication Schema
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen - Restaurant POS & Billing Software",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant POS System",
    "operatingSystem": "Web, iOS, Android",
    "offers": [
      {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": ["US", "GB"]
      },
      {
        "@type": "Offer",
        "price": "999",
        "priceCurrency": "INR",
        "priceValidUntil": "2026-12-31",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": "IN"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    },
    "description": "Best restaurant POS and billing software with AI voice ordering, QR code menus, zero transaction fees. Affordable Square, Toast & Petpooja alternative. GST billing for India. Free 30-day trial.",
    "featureList": [
      "AI Voice Ordering",
      "QR Code Menu & Ordering",
      "Restaurant POS System",
      "Loyalty & Rewards Program",
      "Points Redemption System",
      "WhatsApp Marketing",
      "Zero Transaction Fees",
      "GST Billing (India)",
      "Inventory Management",
      "Kitchen Display System (KDS)",
      "Table Management",
      "Multi-location Support",
      "Online Ordering",
      "Real-time Analytics",
      "Zomato & Swiggy Integration",
      "UPI & Card Payments"
    ],
    "screenshot": `${baseUrl}/screenshots/pos-dashboard.jpg`,
    "softwareVersion": "2.0",
    "releaseNotes": "AI Voice Ordering, QR Menus, Zero Transaction Fees"
  };

  // LocalBusiness Schema (for GEO SEO)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen",
    "image": `${baseUrl}/og-image.jpg`,
    "@id": baseUrl,
    "url": baseUrl,
    "telephone": "+91-XXX-XXX-XXXX",
    "priceRange": "₹₹₹",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressLocality": "India"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.6139",
      "longitude": "77.2090"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      }
    ]
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is an AI-powered restaurant management system with voice & chat AI agent for order taking, complete POS system, inventory management, supply chain management, table management, and hotel PMS. It's designed to help restaurants streamline operations and increase efficiency with AI technology."
        }
      },
      {
        "@type": "Question",
        "name": "What is AI Agent for Restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen's AI Agent is an intelligent voice and chat assistant that takes orders via voice commands, answers customer questions, manages tables, and handles restaurant operations through natural conversation. It supports voice order taking, smart table management, and instant answers to restaurant queries."
        }
      },
      {
        "@type": "Question",
        "name": "How does voice order taking work in DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen's AI Agent uses advanced speech recognition and AI to understand voice commands for order taking. Simply speak your order, and the AI agent processes it, matches items to your menu, and adds them to the cart automatically. It supports Indian accents and works in real-time."
        }
      },
      {
        "@type": "Question",
        "name": "How much does DineOpen cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen offers flexible pricing starting at ₹999 per month for the Starter plan, perfect for small cafes. We also offer Pro and Enterprise plans with more features. All plans include a 1-month free trial with no credit card required."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support multiple restaurants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports multi-restaurant management, allowing you to manage multiple locations from a single dashboard. This is perfect for restaurant chains or franchise owners."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use DineOpen on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen is fully responsive and works seamlessly on phones, tablets, and computers. You can manage your restaurant operations from anywhere with an internet connection."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods does DineOpen accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen integrates with multiple payment gateways including Razorpay, supporting cash, card, UPI, and digital wallet payments. We don't charge any transaction fees."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free trial available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer a 1-month free trial for all new users. No credit card required. You can explore all features during the trial period."
        }
      },
      {
        "@type": "Question",
        "name": "What is the best restaurant POS system in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the best AI-powered restaurant POS system in India, starting at ₹999/month with zero transaction fees. Unlike competitors like Petpooja (₹1,999/month + 1.5-2% fees) or POSist (₹1,799/month + 1.5% fees), DineOpen offers AI features, unlimited multi-restaurant support, and saves restaurants ₹53,000-₹60,000+ per year."
        }
      },
      {
        "@type": "Question",
        "name": "Which restaurant POS system has no transaction fees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the only major restaurant POS system in India with zero transaction fees. Competitors like Petpooja, POSist, Gofrugal, Razorpay POS, and Zomato Base all charge 1.5-2.6% transaction fees, which can cost restaurants ₹40,000-₹60,000+ per year."
        }
      },
      {
        "@type": "Question",
        "name": "What is the cheapest restaurant management software in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the most cost-effective restaurant management software in India at ₹999/month. Combined with zero transaction fees, it costs ₹11,988 per year, compared to competitors that cost ₹50,000-₹72,000+ per year including fees."
        }
      },
      {
        "@type": "Question",
        "name": "Which restaurant POS supports multiple locations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen offers unlimited multi-restaurant support included in all plans. Unlike Petpooja, POSist, and Gofrugal which charge additional fees for multiple locations, DineOpen allows you to manage unlimited restaurants from a single dashboard at no extra cost."
        }
      },
      {
        "@type": "Question",
        "name": "How much does a restaurant POS system cost in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Restaurant POS systems in India cost ₹999-₹2,500/month plus 1.5-2.6% transaction fees. DineOpen costs ₹999/month with zero transaction fees (total: ₹11,988/year). Petpooja costs ₹1,999/month + fees (₹67,188/year), POSist costs ₹1,799/month + fees (₹64,788/year), making DineOpen the most affordable option."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen have AI features?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen is the only restaurant POS system in India with comprehensive AI features including AI-powered voice ordering, AI menu extraction from images, and intelligent order matching. Competitors like Petpooja, POSist, Zomato Base, and Swiggy do not offer AI capabilities."
        }
      },
      {
        "@type": "Question",
        "name": "Compare DineOpen vs Petpooja vs POSist",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen (₹999/month, 0% fees) vs Petpooja (₹1,999/month, 1.5-2% fees) vs POSist (₹1,799/month, 1.5% fees). DineOpen is 50% cheaper, includes AI features, unlimited multi-restaurant support, and saves ₹53,000-₹60,000+ per year compared to competitors."
        }
      }
    ]
  };

  // WebSite Schema with SearchAction (for better SEO)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DineOpen",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Product Schema for AI Agent
  const aiAgentProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "AI Agent for Restaurant",
    "description": "Intelligent voice and chat assistant for restaurants that takes orders via voice commands, answers questions, manages tables, and handles operations through natural conversation.",
    "brand": {
      "@type": "Brand",
      "name": "DineOpen"
    },
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/products/ai-agent`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };

  // Service Schema for Restaurant Management
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Restaurant Management Software",
    "name": "Restaurant Management System",
    "description": "Complete restaurant management software with POS system, AI agent, inventory management, supply chain, table management, and hotel PMS. Starts at ₹999/month.",
    "provider": {
      "@type": "Organization",
      "name": "DineOpen"
    },
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "India" }
    ],
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": "https://www.dineopen.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "DineOpen Products",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Agent for Restaurant"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Restaurant Management System"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Restaurant POS System"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Inventory Management"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Supply Chain Management"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Hotel Management (PMS)"
          }
        }
      ]
    }
  };

  // Restaurant Management Software Product Schema
  const restaurantManagementSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Restaurant Management Software",
    "description": "Complete restaurant management software with POS system, AI agent, fast billing, KOT system, menu management, table orders, inventory management, and supply chain management. Everything your restaurant needs in one platform.",
    "brand": {
      "@type": "Brand",
      "name": "DineOpen"
    },
    "category": "Restaurant Management Software",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "url": "https://www.dineopen.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "200"
    },
    "featureList": [
      "Restaurant POS System",
      "Fast Billing",
      "KOT System",
      "Menu Management",
      "Table Management",
      "Voice-AI Assistant",
      "Inventory Management",
      "Supply Chain Management",
      "QR Code Menu",
      "Multi-restaurant Support"
    ]
  };

  // ItemList Schema for Competitor Comparison (helps with "vs" queries)
  const comparisonListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Restaurant POS System Comparison",
    "description": "Compare DineOpen with Square, Toast, and Petpooja restaurant POS systems",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "DineOpen",
        "url": `${baseUrl}`,
        "description": "AI-powered restaurant POS with voice ordering, zero transaction fees. Starting at $10/month."
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Square for Restaurants",
        "url": `${baseUrl}/alternatives/square`,
        "description": "Compare DineOpen vs Square POS. Save on transaction fees."
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Toast POS",
        "url": `${baseUrl}/alternatives/toast`,
        "description": "Compare DineOpen vs Toast. No hardware lock-in, month-to-month billing."
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Petpooja",
        "url": `${baseUrl}/alternatives/petpooja`,
        "description": "Compare DineOpen vs Petpooja. Best POS for Indian restaurants."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiAgentProductSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantManagementSchema) }}
      />
    </>
  );
}

