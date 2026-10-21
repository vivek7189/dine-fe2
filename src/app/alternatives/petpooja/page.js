import PetpoojaAlternativeClient from './PetpoojaAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: '#1 Petpooja Alternative 2026 | Free Trial, Published Prices | DineOpen',
  description: 'Looking for a Petpooja alternative? Honest comparison of features & pricing. DineOpen: AI voice ordering and all features included from $20/mo (from ₹899/month in India). Petpooja prices sourced from its pricing page. 7-day free trial.',
  keywords: 'Petpooja alternative, Petpooja alternative free, Petpooja similar software, Petpooja competitor, top competitors to Petpooja, Petpooja app review, Petpooja POS review, restaurant POS India, GST billing software, Petpooja vs DineOpen, affordable restaurant POS India',
  openGraph: {
    title: 'DineOpen vs Petpooja — Honest Comparison 2026',
    description: 'Fair, detailed comparison of DineOpen and Petpooja. Features, pricing, trade-offs. See where each POS wins — and which is right for your restaurant.',
    url: 'https://www.dineopen.com/alternatives/petpooja',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen vs Petpooja — Honest Comparison 2026',
    description: 'Fair comparison of features, pricing & trade-offs. See which POS is right for your restaurant.',
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
        "text": "DineOpen is better for small-to-medium restaurants that want affordable pricing ($20/month, or from ₹899/month in India, vs Petpooja's Base plan listed at ₹12,000 + taxes, with higher plans from ₹20,000), AI features like voice ordering, and all features in one plan. Petpooja is better for restaurants that rely heavily on Zomato/Swiggy delivery integration. Both offer GST billing and cloud-based POS."
      }
    },
    {
      "@type": "Question",
      "name": "How much cheaper is DineOpen vs Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen Starter plan starts at $20/month (from ₹899/month in India) with ALL features included — inventory, loyalty, analytics, QR ordering. Petpooja's pricing page (checked 21 October 2026) lists the Base plan at ₹12,000 + taxes without stating the billing period, Operations Manager plans at ₹20,000 or ₹30,000 and Marketing Manager plans at ₹20,000 to ₹40,000, each including Base. Neither lists a per-order fee; card and UPI payments carry your payment gateway's own charges whichever POS you use. Ask Petpooja what period its price covers to compare like for like."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Petpooja to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, switching is easy. Start a free 7-day trial alongside Petpooja. Add your menu using AI photo extraction (2 minutes). Train staff (15 minutes). Run both systems in parallel for a few days, then switch. No downtime, no data loss, no contracts."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have Zomato and Swiggy integration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen does not currently have direct Zomato/Swiggy integration — this is an area where Petpooja has an advantage. However, DineOpen offers direct ordering channels (QR code, WhatsApp, website ordering) that help restaurants take orders without paying 25-30% aggregator commissions."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support GST billing like Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides full GST compliance — CGST, SGST, IGST auto-calculated. GST-compliant invoices with GSTIN, HSN/SAC codes, and GSTR-1 compatible reports. Works for both 5% (non-AC) and 18% (AC restaurant) tax rates."
      }
    },
    {
      "@type": "Question",
      "name": "What features does DineOpen have that Petpooja doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers AI voice ordering in Hindi, English, Tamil, and Marathi. AI-powered menu extraction from photos. Petpooja's Base plan lists an AI agent; ask them what it covers. DineOpen also includes loyalty, customer database and SMS/WhatsApp marketing in its plan, where Petpooja puts them in its Marketing Manager plan (from ₹20,000 + taxes). DineOpen bills monthly and offers a 7-day free trial with no card."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free Petpooja alternative?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen offers a 7-day free trial with all features included — no credit card required. After the trial, the Starter plan starts at $20/month (from ₹899/month in India), with no per-transaction fee from DineOpen. This makes it one of the most affordable Petpooja alternatives available in India."
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
