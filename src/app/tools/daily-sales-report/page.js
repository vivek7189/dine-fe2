import DailySalesReportClient from './DailySalesReportClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Daily Sales Report Generator [Free] — Track Revenue | DineOpen',
  description: 'Free restaurant daily sales report generator — track revenue by channel, reconcile cash, break down payments by method, log daily expenses, and download a professional PDF. No login, no signup required.',
  keywords: 'restaurant daily sales report template, daily sales report format, restaurant cash register report, daily sales tracker restaurant, restaurant closing report, daily revenue report, restaurant daily report format, cash reconciliation template restaurant',
  openGraph: {
    title: 'Restaurant Daily Sales Report Generator [Free] — Track Revenue | DineOpen',
    description: 'Generate professional daily sales reports with cash reconciliation, payment breakdown, expense tracking, and PDF download. Free, no login required.',
    url: 'https://www.dineopen.com/tools/daily-sales-report',
    siteName: 'DineOpen',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen Daily Sales Report Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Daily Sales Report Generator [Free] | DineOpen',
    description: 'Generate professional daily sales reports with cash reconciliation, payment breakdown, and expense tracking. No signup needed.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/daily-sales-report',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DineOpen Daily Sales Report Generator',
  description:
    'Free restaurant daily sales report generator with cash reconciliation, payment breakdown by method, expense tracking, P&L summary, and PDF download.',
  url: 'https://www.dineopen.com/tools/daily-sales-report',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'DineOpen',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.dineopen.com/favicon.png',
    },
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What should a daily sales report include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A restaurant daily sales report should include total sales broken down by channel (dine-in, takeaway, delivery), a payment method breakdown (cash, card, UPI, online), cash reconciliation (opening cash, cash received, cash expenses, expected vs actual closing cash), daily expenses by category, and a P&L summary showing gross profit and margin. Order counts per channel are also valuable for tracking average ticket size.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I reconcile cash at the end of the day?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cash reconciliation formula: Opening Cash + Cash Received − Cash Expenses = Expected Closing Cash. Count the actual cash in the till and compare it to the expected amount. A positive difference means excess cash (possible over-ring), and a negative difference indicates a shortage. Always document the variance and investigate anything beyond your accepted tolerance — typically ±₹200 for a small restaurant.',
      },
    },
    {
      '@type': 'Question',
      name: "What's a normal cash variance for restaurants?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Most well-run restaurants accept a cash variance of ±0.1% of daily sales or a flat ±₹200–₹500 (±$5–$10 in USD markets), whichever is smaller. Variances above 0.5% of daily sales should trigger an immediate review of POS records, voids, and refunds. Consistently negative variances may indicate systematic errors or theft and require a thorough audit.",
      },
    },
    {
      '@type': 'Question',
      name: 'Should I track sales by payment method?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Tracking sales by payment method (cash, card, UPI, online aggregators) is essential for cash flow management, reconciliation with bank statements, and calculating merchant fee costs. Online aggregator sales (Swiggy, Zomato, DoorDash) often attract commissions of 20–30%, so knowing that split helps you measure the true profitability of each channel and make informed decisions about platform relationships.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long should I keep daily sales reports?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In India, the Income Tax Act requires businesses to retain financial records for at least 6 years from the end of the relevant assessment year. In the US, the IRS recommends keeping business records for at least 3–7 years. In the UK, HMRC requires 5 years of records for self-employed businesses. As a best practice, keep daily sales reports for 7 years, stored both digitally (cloud backup) and as printed copies for the most recent year.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.dineopen.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Free Tools',
      item: 'https://www.dineopen.com/tools',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Daily Sales Report Generator',
      item: 'https://www.dineopen.com/tools/daily-sales-report',
    },
  ],
};

export default function DailySalesReportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DailySalesReportClient />
    </>
  );
}
