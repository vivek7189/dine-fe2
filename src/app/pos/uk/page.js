import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS System UK | AI Voice Ordering | EPOS Alternative | DineOpen',
  description: 'Best restaurant POS for UK restaurants. AI voice ordering, QR menus, VAT-compliant billing. Affordable alternative to Epos Now, Lightspeed. Free 7-day trial. From £16/month.',
  keywords: 'restaurant POS UK, restaurant EPOS system, UK restaurant software, Epos Now alternative, Lightspeed alternative, restaurant billing software UK, cafe POS UK, pub POS system, British restaurant POS, QR menu ordering UK, VAT billing restaurant',
  openGraph: {
    title: 'Restaurant POS System UK | AI Voice Ordering | DineOpen',
    description: 'AI-powered restaurant POS for UK restaurants. VAT-compliant, affordable. Free trial.',
    url: 'https://www.dineopen.com/pos/uk',
    siteName: 'DineOpen',
    locale: 'en_GB',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/uk',
    languages: {
      'x-default': 'https://www.dineopen.com',
      'en-US': 'https://www.dineopen.com/pos/usa',
      'en-GB': 'https://www.dineopen.com/pos/uk',
      'en-IN': 'https://www.dineopen.com/india',
      'en-AE': 'https://www.dineopen.com/pos/uae',
      'en-SG': 'https://www.dineopen.com/pos/singapore',
      'en-CA': 'https://www.dineopen.com/pos/canada',
      'en-AU': 'https://www.dineopen.com/pos/australia',
    },
  },
};

export default function UKPOSPage() {
  const cityData = {
    city: 'United Kingdom',
    state: '',
    country: 'UK',
    currency: '£',
    currencyCode: 'GBP',
    price: '16',
    highlights: [
      'VAT-compliant billing for UK restaurants',
      'AI voice ordering with UK accent support',
      'Deliveroo, Just Eat, Uber Eats ready',
      'Works on any device - iPad, Android, PC',
      'Month-to-month billing, no contracts',
    ],
    deliveryPlatforms: 'Connect with Deliveroo, Just Eat & Uber Eats',
    testimonial: {
      quote: 'DineOpen transformed our gastropub in Shoreditch. The QR ordering reduced our wait times and the AI helps during busy weekend rushes.',
      author: 'James Williams',
      business: 'The Crafty Fox Pub',
    },
    localKeywords: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool', 'Bristol', 'Leeds', 'Glasgow', 'Cardiff', 'Brighton'],
    complianceInfo: [
      { title: 'VAT 20% Ready', desc: 'Automatic VAT calculation at 20% standard rate. Handles zero-rated food vs hot takeaway distinctions.' },
      { title: "Natasha's Law Allergens", desc: "Full allergen labelling support for 14 major allergens as required by Natasha's Law for pre-packed food." },
      { title: 'HMRC Making Tax Digital', desc: 'Digital record keeping compatible with HMRC Making Tax Digital (MTD) requirements.' },
    ],
    paymentMethods: ['Contactless', 'Apple Pay', 'Google Pay', 'PayPal', 'Visa', 'Mastercard', 'Amex', 'Cash'],
    localCompetitors: [
      { name: 'Epos Now', price: '£25/mo', note: 'Basic features, extra charges for integrations' },
      { name: 'Lightspeed', price: '£69/mo', note: 'Powerful but expensive for small restaurants' },
      { name: 'iZettle (Zettle)', price: '1.75% per txn', note: 'Limited restaurant-specific features' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS UK",
    "description": "AI-powered restaurant EPOS system for UK restaurants with VAT-compliant billing.",
    "url": "https://www.dineopen.com/pos/uk",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "16",
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock"
    },
    "areaServed": { "@type": "Country", "name": "United Kingdom" },
  };


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
