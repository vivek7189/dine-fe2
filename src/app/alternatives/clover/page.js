import CloverAlternativeClient from './CloverAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Clover POS Alternative 2026 | DineOpen - AI-Powered, No Hardware Lock-in',
  description: 'Looking for a Clover alternative? DineOpen offers AI voice ordering, works on any device (no Clover hardware needed), zero transaction fees. Free 30-day trial.',
  keywords: 'Clover alternative, Clover POS alternative, better than Clover, Clover competitor, Clover replacement, restaurant POS no hardware, AI restaurant POS, Clover for restaurants alternative',
  openGraph: {
    title: 'Best Clover POS Alternative | DineOpen - AI-Powered, No Hardware',
    description: 'Switch from Clover to DineOpen. Works on any device, AI voice ordering, zero fees.',
    url: 'https://www.dineopen.com/alternatives/clover',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/clover',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen better than Clover?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers AI voice ordering, zero transaction fees compared to Clover's 2.3% + $0.10, and requires no expensive hardware ($599+ for Clover). DineOpen works on any device you already own."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs Clover?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs $9.99/month versus Clover's $14.95+/month. You also avoid Clover's $599+ hardware costs and transaction fees, saving thousands per year."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen require hardware like Clover?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, DineOpen works on any device — phone, tablet, or laptop. There is no need to purchase expensive proprietary hardware like Clover requires."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Clover to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching from Clover to DineOpen is easy with our guided migration. Start a free 30-day trial to test all features before fully committing."
      }
    },
    {
      "@type": "Question",
      "name": "What features does DineOpen have that Clover doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen includes AI voice ordering, an AI chat assistant, built-in loyalty programs, and zero transaction fees — features not available with Clover out of the box."
      }
    }
  ]
};

export default function CloverAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CloverAlternativeClient />
    </>
  );
}
