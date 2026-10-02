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
    "description": "The Global Restaurant Operating System. All-in-one platform for Cloud POS, waiter apps, table reservations, inventory management, AI analytics, and loyalty programs. Trusted by 50,000+ restaurants across 20+ countries.",
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
    ]
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
        "name": "Starter Plan",
        "price": "20",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": ["US", "GB", "AE", "SG", "CA", "AU"]
      },
      {
        "@type": "Offer",
        "name": "Starter Plan (India)",
        "price": "899",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": "IN"
      }
    ],
    "description": "The all-in-one restaurant operating system powering 50,000+ restaurants worldwide. Cloud POS, waiter apps, table reservations, inventory management, AI analytics, and loyalty programs. Free trial available.",
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
        "price": "20",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": `${baseUrl}/products/pos`
      },
      {
        "@type": "Offer",
        "price": "899",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": `${baseUrl}/restaurant-pos-software-india`
      }
    ]
  };

  // Service Schema for Restaurant Management
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Restaurant Operating System",
    "name": "DineOpen - The Global Restaurant Operating System",
    "description": "All-in-one restaurant operating system with Cloud POS, Waiter Apps, Table Reservations, Inventory Management, AI Analytics, and Loyalty Programs. Powering 50,000+ restaurants across 20+ countries.",
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
        "price": "20",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "price": "899",
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
    "description": "The all-in-one restaurant operating system powering restaurants worldwide. Cloud POS (bill in 3 seconds), waiter apps, online table reservations, smart inventory, AI analytics, and loyalty programs. Trusted by 50,000+ restaurants globally.",
    "image": `${baseUrl}/favicon.png`,
    "brand": {
      "@type": "Brand",
      "name": "DineOpen"
    },
    "category": "Restaurant Operating System",
    "offers": [
      {
        "@type": "Offer",
        "price": "20",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      },
      {
        "@type": "Offer",
        "price": "899",
        "priceCurrency": "INR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "url": "https://www.dineopen.com/pricing"
      }
    ],
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
        "description": "The Global Restaurant Operating System. Cloud POS, waiter apps, reservations, inventory, analytics & loyalty. Trusted by 50,000+ restaurants worldwide."
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

