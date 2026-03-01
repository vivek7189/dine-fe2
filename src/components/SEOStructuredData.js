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
    "description": "The Global Restaurant Operating System. All-in-one platform for Cloud POS, waiter apps, table reservations, inventory management, AI analytics, and loyalty programs. Trusted by 1000+ restaurants across 20+ countries.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@dineopen.com",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      "https://twitter.com/dineopenoffice",
      "https://www.linkedin.com/company/dineopen",
      "https://www.instagram.com/dineopenofficial",
      "https://www.youtube.com/@dineopen"
    ],
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "India" },
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Singapore" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1000"
    }
  };

  // SoftwareApplication Schema
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen - The Global Restaurant Operating System",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Management Platform",
    "operatingSystem": "Web, iOS, Android",
    "offers": [
      {
        "@type": "Offer",
        "name": "Spark Plan",
        "price": "9.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": ["US", "GB", "AE", "SG", "CA", "AU"]
      },
      {
        "@type": "Offer",
        "name": "Spark Plan (India)",
        "price": "300",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": "IN"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1000"
    },
    "description": "The all-in-one restaurant operating system powering 1000+ restaurants worldwide. Cloud POS, waiter apps, table reservations, inventory management, AI analytics, and loyalty programs. Free trial available.",
    "featureList": [
      "Lightning-Fast Cloud POS",
      "Waiter & Captain App",
      "Online Table Reservations",
      "Smart Inventory Management",
      "AI-Powered Analytics",
      "Loyalty & Rewards Program",
      "Kitchen Display System (KDS)",
      "Multi-location Support",
      "Menu Management",
      "Real-time Reporting",
      "Zomato & Swiggy Integration",
      "UPI & Card Payments",
      "GST Billing (India)",
      "Zero Transaction Fees",
      "WhatsApp Marketing"
    ],
    "screenshot": `${baseUrl}/screenshots/pos-dashboard.jpg`,
    "softwareVersion": "3.0",
    "releaseNotes": "Global Restaurant Operating System - POS, Orders, Inventory, Analytics, Growth"
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

  // FAQ Schema (Single unified FAQ - covers global + India context)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a cloud-based restaurant operating system that powers restaurants worldwide. It includes a complete POS system, waiter & captain apps, online table reservations, inventory management, AI-powered analytics, kitchen display system, and loyalty programs. It works on any device with internet access and does not require hardware installation. Trusted by 1000+ restaurants across 20+ countries."
        }
      },
      {
        "@type": "Question",
        "name": "How much does DineOpen cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen starts at $9.99/month (Spark plan) for international users, with localized pricing available in each region. The Blaze plan for restaurant chains is $89/month. All plans include a 30-day free trial with no credit card required, zero transaction fees, and unlimited menu items."
        }
      },
      {
        "@type": "Question",
        "name": "What features does DineOpen include?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen includes: AI Agent with voice and chat ordering, Lightning-Fast Cloud POS (bill in 3 seconds), Waiter & Captain App for tableside ordering, Online Table Reservations (24/7 booking), Smart Inventory with auto low-stock alerts, AI Analytics for business insights, Kitchen Display System, Loyalty & Rewards, and integrations with delivery platforms like Zomato and Swiggy."
        }
      },
      {
        "@type": "Question",
        "name": "Which countries does DineOpen serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is a global platform serving restaurants in USA, UK, India, UAE, Singapore, Canada, Australia, and 20+ other countries. Our cloud-based system works anywhere with internet access, with localized billing, tax support, and payment gateways for each region."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free trial available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all new users. No credit card required. You get access to all features during the trial period including AI Agent, POS, inventory management, and analytics."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support multiple restaurant locations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports multi-restaurant management. The Spark plan supports up to 3 locations, and the Blaze plan offers unlimited locations with a centralized chain dashboard, cross-location analytics, and centralized menu management."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use DineOpen on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen is fully responsive and works seamlessly on phones, tablets, and computers. The dedicated Waiter App allows tableside ordering, and managers can monitor operations from anywhere with an internet connection."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen charge transaction fees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, DineOpen charges zero transaction fees on all plans. You only pay the monthly subscription. Payment processing fees from your payment gateway (Razorpay, Dodo Payments, etc.) apply as standard, but DineOpen does not add any additional fees on top."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen have AI features?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen includes comprehensive AI features: AI-powered voice ordering where customers can place orders by speaking, AI chat assistant for customer queries, AI menu extraction from images (snap a photo of your menu to digitize it), and intelligent analytics for business insights."
        }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen compare to other restaurant POS systems?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen stands out with AI-powered features (voice ordering, chat assistant), zero transaction fees, and significantly lower pricing compared to alternatives like Square, Toast, Petpooja, and POSist. DineOpen also includes unlimited menu items and multi-location support at no extra cost in most plans."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods does DineOpen support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen integrates with multiple payment gateways. International users get Dodo Payments supporting cards and PayPal. Indian users get Razorpay supporting UPI, cards, and netbanking. Cash payments are also supported. No additional transaction fees from DineOpen."
        }
      },
      {
        "@type": "Question",
        "name": "Is DineOpen suitable for small restaurants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen is designed for restaurants of all sizes. The Spark plan at $9.99/month is perfect for small cafes and restaurants, offering AI Agent, unlimited menu items, complete POS system, unlimited tables, and real-time kitchen display. No hardware installation or technical expertise required."
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

  // Product Schema for Cloud POS
  const cloudPOSProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DineOpen Cloud POS",
    "description": "Bill in 3 seconds flat with DineOpen's cloud-based POS system. Works on any device, syncs in real-time, supports multiple payment methods including UPI, cards, cash, and PayPal. Part of the Global Restaurant Operating System.",
    "image": `${baseUrl}/favicon.png`,
    "brand": {
      "@type": "Brand",
      "name": "DineOpen"
    },
    "offers": [
      {
        "@type": "Offer",
        "price": "9.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": `${baseUrl}/products/pos-software`
      },
      {
        "@type": "Offer",
        "price": "300",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": `${baseUrl}/restaurant-pos-software-india`
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    }
  };

  // Service Schema for Restaurant Management
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Restaurant Operating System",
    "name": "DineOpen - The Global Restaurant Operating System",
    "description": "All-in-one restaurant operating system with Cloud POS, Waiter Apps, Table Reservations, Inventory Management, AI Analytics, and Loyalty Programs. Powering 1000+ restaurants across 20+ countries.",
    "provider": {
      "@type": "Organization",
      "name": "DineOpen"
    },
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "India" },
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Singapore" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" }
    ],
    "offers": [
      {
        "@type": "Offer",
        "price": "9.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "price": "300",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "DineOpen Restaurant Operating System",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Lightning-Fast Cloud POS"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Waiter & Captain App"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Online Table Reservations"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Smart Inventory Management"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI-Powered Analytics"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Loyalty & Rewards Program"
          }
        }
      ]
    }
  };

  // Restaurant Management Software Product Schema
  const restaurantManagementSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DineOpen Restaurant Operating System",
    "description": "The all-in-one restaurant operating system powering restaurants worldwide. Cloud POS (bill in 3 seconds), waiter apps, online table reservations, smart inventory, AI analytics, and loyalty programs. Trusted by 1000+ restaurants globally.",
    "image": `${baseUrl}/favicon.png`,
    "brand": {
      "@type": "Brand",
      "name": "DineOpen"
    },
    "category": "Restaurant Operating System",
    "offers": [
      {
        "@type": "Offer",
        "price": "9.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "price": "300",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1000"
    },
    "featureList": [
      "Lightning-Fast Cloud POS",
      "Waiter & Captain App",
      "Online Table Reservations",
      "Smart Inventory Management",
      "AI-Powered Analytics",
      "Loyalty & Rewards Program",
      "Kitchen Display System",
      "Menu Management",
      "Multi-location Support",
      "Real-time Reporting"
    ]
  };

  // ItemList Schema for Competitor Comparison (helps with "vs" queries)
  const comparisonListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Restaurant Operating System Comparison",
    "description": "Compare DineOpen - The Global Restaurant Operating System with Square, Toast, Petpooja, and POSist",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "DineOpen",
        "url": `${baseUrl}`,
        "description": "The Global Restaurant Operating System. Cloud POS, waiter apps, reservations, inventory, analytics & loyalty. Trusted by 1000+ restaurants worldwide."
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Square for Restaurants",
        "url": `${baseUrl}/alternatives/square`,
        "description": "Compare DineOpen vs Square. All-in-one platform with zero transaction fees."
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Toast POS",
        "url": `${baseUrl}/alternatives/toast`,
        "description": "Compare DineOpen vs Toast. No hardware lock-in, more features included."
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Petpooja",
        "url": `${baseUrl}/alternatives/petpooja`,
        "description": "Compare DineOpen vs Petpooja. Global platform with local support."
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "POSist",
        "url": `${baseUrl}/alternatives/posist`,
        "description": "Compare DineOpen vs POSist. Complete operating system at better value."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cloudPOSProductSchema) }}
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

