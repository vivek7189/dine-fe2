import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Coimbatore | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Coimbatore restaurants. GST billing, Tamil menus, Zomato/Swiggy integration, UPI payments. Perfect for Kongunadu cuisine & textile city restaurants.',
  keywords: 'restaurant POS Coimbatore, billing software Coimbatore, restaurant management Coimbatore, GST billing software Coimbatore, Tamil POS Coimbatore, Kongunadu food POS, South Indian restaurant Coimbatore',
  openGraph: {
    title: 'Best Restaurant POS Software in Coimbatore | DineOpen',
    description: 'Top-rated restaurant POS for Coimbatore. GST billing, Tamil support, delivery integration. Free trial.',
    url: 'https://www.dineopen.com/pos/coimbatore',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/coimbatore',
  },
};

export default function CoimbatorePOSPage() {
  const cityData = {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Tamil Nadu',
      'Tamil voice ordering & menu display',
      'Zomato & Swiggy direct integration',
      'Perfect for Kongunadu cuisine',
      'UPI, GPay, PhonePe payments',
      'Filter coffee shop management',
    ],
    restaurants: '800+',
    testimonial: {
      quote: 'Our Kongunadu restaurant serves authentic Coimbatore cuisine. DineOpen Tamil menu and voice ordering made our operations smoother.',
      author: 'Senthil Kumar',
      business: 'Sree Annapoorna, Coimbatore',
    },
    localKeywords: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Race Course', 'Town Hall', 'Ukkadam', 'Singanallur'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Coimbatore",
    "description": "Restaurant POS and billing software for Coimbatore restaurants with GST billing and Tamil support.",
    "url": "https://www.dineopen.com/pos/coimbatore",
    "areaServed": { "@type": "City", "name": "Coimbatore", "containedInPlace": { "@type": "State", "name": "Tamil Nadu" } },
    "priceRange": "₹₹",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Coimbatore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Coimbatore, offering GST-compliant billing for Tamil Nadu, Tamil voice ordering, and Zomato/Swiggy integration. Perfect for Kongunadu cuisine and filter coffee shops. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Coimbatore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Coimbatore restaurants. Orders from RS Puram, Gandhipuram, Peelamedu, and Saibaba Colony flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Coimbatore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Coimbatore restaurants, including GST billing, Tamil menus, QR ordering, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Tamil voice ordering in Coimbatore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Tamil and English, ideal for Coimbatore's Kongunadu restaurants and South Indian eateries. Staff can take orders and display menus in Tamil."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Coimbatore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Coimbatore restaurants. No credit card required. Get full access to Tamil language support, GST billing, and filter coffee shop management features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
