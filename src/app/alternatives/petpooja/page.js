import PetpoojaAlternativeClient from './PetpoojaAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Petpooja Alternative 2026 | DineOpen - AI POS, Lower Fees India',
  description: 'Looking for a Petpooja alternative? DineOpen offers AI voice ordering, zero transaction fees vs Petpooja\'s 1.5-2%. GST billing, Zomato/Swiggy integration. Save ₹50,000+/year. Free 30-day trial.',
  keywords: 'Petpooja alternative, Petpooja alternative India, better than Petpooja, Petpooja competitor, restaurant POS India, GST billing software, Petpooja vs DineOpen, affordable restaurant POS India, AI POS India, restaurant billing software India, Zomato integration POS',
  openGraph: {
    title: 'Best Petpooja Alternative | DineOpen - AI-Powered, Lower Fees',
    description: 'Switch from Petpooja to DineOpen. Get AI voice ordering, zero transaction fees, GST billing. Free 30-day trial.',
    url: 'https://www.dineopen.com/alternatives/petpooja',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-petpooja-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best Petpooja Alternative in India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Petpooja Alternative | DineOpen - AI POS, Lower Fees',
    description: 'Switch from Petpooja to DineOpen. AI voice ordering, zero transaction fees, GST billing. Free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/petpooja',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers AI voice ordering and zero transaction fees compared to Petpooja's 1.5-2% fees. DineOpen starts at just ₹300/month, making it a more affordable and feature-rich alternative."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at ₹300/month compared to Petpooja's ₹1,000+/month. With zero transaction fees, restaurants save ₹50,000+ per year by switching to DineOpen."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Petpooja to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching from Petpooja to DineOpen is easy with our guided migration process. You can start a free 30-day trial to test DineOpen before fully switching."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have Zomato/Swiggy integration like Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers direct integration with both Zomato and Swiggy, just like Petpooja. Additionally, DineOpen includes AI voice ordering that Petpooja does not offer."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support GST billing like Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides full GST compliance with automated tax reports. All billing and invoicing meets Indian tax requirements out of the box."
      }
    }
  ]
};

export default function PetpoojaAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PetpoojaAlternativeClient />
    </>
  );
}
