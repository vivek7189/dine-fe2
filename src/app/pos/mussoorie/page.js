import MussooriePOSClient from './MussooriePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Mussoorie | Hill Station Cafe & Hotel | DineOpen',
  description: 'Best restaurant POS for Mussoorie. Perfect for Mall Road cafes, hotel restaurants, bakeries & tourist eateries. Valley view seating, seasonal rush management. ₹999/month.',
  keywords: 'restaurant POS Mussoorie, Mall Road cafe software, hill station restaurant billing, hotel POS Mussoorie, tourist restaurant software, bakery POS Uttarakhand',
  openGraph: {
    title: 'Restaurant POS Software Mussoorie | Hill Station Cafe & Hotel | DineOpen',
    description: 'POS for Mussoorie cafes and hotels. Tourist-friendly, seasonal management, valley view billing.',
    url: 'https://www.dineopen.com/pos/mussoorie',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/mussoorie' },
};

export default function MussooriePOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Mussoorie",
    "description": "Restaurant POS for Mussoorie's hill station cafes, hotel restaurants, and tourist eateries.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Mussoorie" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Mussoorie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Mussoorie, offering Mall Road cafe billing, hotel restaurant management, seasonal rush handling, and valley view seating management. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Mussoorie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Mussoorie restaurants. Orders flow automatically into your POS, perfect for Mall Road cafes and hotel restaurants."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Mussoorie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Mussoorie restaurants, including GST billing, tourist-friendly QR menus, seasonal billing management, and bakery support. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Mussoorie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Mussoorie's hill station cafes and hotel restaurants. QR menus also serve tourists in multiple languages."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Mussoorie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Mussoorie restaurants and cafes. No credit card required. Get full access to seasonal management, GST billing, and tourist-friendly features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MussooriePOSClient />
    </>
  );
}
