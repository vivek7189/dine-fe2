import FSSAIGuideClient from './FSSAIGuideClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'FSSAI License for Restaurants 2024 | Complete Registration Guide | DineOpen',
  description: 'Complete guide to FSSAI license for restaurants in India. Registration process, documents required, fees, renewal, types of licenses. Step-by-step instructions.',
  keywords: 'FSSAI license restaurant, FSSAI registration India, food license apply, FSSAI documents, restaurant food license, FSSAI renewal, food safety license',
  openGraph: {
    title: 'FSSAI License for Restaurants | Complete Guide | DineOpen',
    description: 'Complete FSSAI registration guide for restaurants. Documents, fees, process, and renewal.',
    url: 'https://www.dineopen.com/resources/fssai-guide',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/fssai-guide' },
};

export default function FSSAIGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Get FSSAI License for Restaurant in India",
    "description": "Step-by-step guide to obtaining FSSAI food license for restaurants, cafes, and food businesses in India.",
    "totalTime": "P30D",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "5000"
    },
    "step": [
      { "@type": "HowToStep", "name": "Determine License Type", "text": "Choose between Basic, State, or Central license based on turnover" },
      { "@type": "HowToStep", "name": "Gather Documents", "text": "Collect identity proof, address proof, food safety plan, and other required documents" },
      { "@type": "HowToStep", "name": "Apply Online", "text": "Register on FSSAI portal and submit application with fees" },
      { "@type": "HowToStep", "name": "Inspection", "text": "Food Safety Officer may inspect premises" },
      { "@type": "HowToStep", "name": "Receive License", "text": "License issued within 60 days of application" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <FSSAIGuideClient />
    </>
  );
}
