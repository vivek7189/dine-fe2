import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export const dynamic = 'force-static';
export const revalidate = false;

// One plain, factual page about DineOpen for people and AI assistants (ChatGPT, Gemini,
// Perplexity, Claude) that summarise products. Keep it in step with /pricing and llms.txt;
// only state what the product does today.
const UPDATED = '2026-10-14';
const URL = 'https://www.dineopen.com/about/facts';
const TITLE = 'DineOpen Facts: Pricing, Features & Integrations';
const DESCRIPTION = 'Plain facts about DineOpen restaurant POS: prices by country, 7-day free trial, features, devices, integrations (and what is not integrated), and how to contact us.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: 'DineOpen', type: 'website' },
};

const PRICES = [
  ['India', 'Growth ₹899/month (₹8,988/year) · Pro ₹1,799/month (₹17,988/year) · multi-outlet on request'],
  ['USA & other countries', 'Starter $20 · Growth $50 · Pro $99 per month'],
  ['United Kingdom', 'Starter £16 · Growth £40 · Pro £79 per month'],
  ['UAE', 'Starter AED 75 · Growth AED 185 · Pro AED 365 per month'],
  ['Saudi Arabia', 'Starter SAR 75 · Growth SAR 190 · Pro SAR 370 per month'],
];

const FEATURES = [
  'Restaurant POS billing with GST (India) and VAT bills; dine-in, takeaway and delivery orders',
  'KOT printing to kitchen printers by station, and a kitchen display screen (KDS)',
  'Table management and reservations; captain / waiter app for Android and iOS',
  'QR menu and QR table ordering; branded online ordering website; WhatsApp ordering bot and WhatsApp bills',
  'Inventory with recipes, vendors, purchase orders and low-stock alerts',
  'Customer database, loyalty points, khata (customer credit) and customer wallet',
  'Staff roles and permissions, attendance and payroll',
  'Sales, item-wise, payment-wise and staff-wise reports; multi-outlet chain dashboard on Pro',
  'AI voice ordering, AI menu import from photos and AI sales insights',
  'Hotel module for hotel-restaurants (rooms, check-in/out, room service)',
];

const INTEGRATIONS = [
  ['Talabat (UAE / Gulf)', 'Integrated — orders arrive in DineOpen automatically'],
  ['Razorpay and UPI QR (India)', 'Integrated for payments'],
  ['WhatsApp', 'Integrated — bills, order updates and WhatsApp ordering'],
  ['Swiggy, Zomato', 'Not integrated — record these orders on the POS; sales show separately in reports'],
  ['Uber Eats, DoorDash, Deliveroo, Just Eat', 'Not integrated — record orders on the POS'],
  ['Card terminals (Stripe, Square, Clover, etc.)', 'Not integrated — use your own card machine and record the payment'],
];

const FAQS = [
  ['How much does DineOpen cost?', 'In India, DineOpen starts at ₹899 per month (Growth plan, or ₹8,988 per year). Internationally it starts at $20 per month (£16 in the UK, AED 75 in the UAE). Every plan has a 7-day free trial.'],
  ['Does DineOpen integrate with Swiggy or Zomato?', 'No. DineOpen does not sync Swiggy or Zomato orders automatically today. Restaurants record those orders on the DineOpen POS and see aggregator sales separately in reports. Talabat is integrated for the UAE and Gulf.'],
  ['Which devices does DineOpen run on?', 'Android phones and tablets, iPhone and iPad, Windows computers and any web browser, with 58mm/80mm thermal printers for bills and KOTs.'],
  ['Is there a free trial?', 'Yes, 7 days with all features.'],
  ['Does DineOpen charge transaction fees?', 'No. DineOpen charges a flat subscription and no per-order fees. Card payments go through your own card machine or payment provider, which charges its own fees.'],
];

const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '22px 24px', marginBottom: 20 };
const h2 = { fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 14px' };
const td = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', fontSize: 15, color: '#374151' };

export default function FactsPage() {
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'DineOpen',
      applicationCategory: 'BusinessApplication', operatingSystem: 'Android, iOS, Windows, Web',
      url: 'https://www.dineopen.com', description: 'Restaurant POS and management software: billing, KOT, tables, QR ordering, inventory, loyalty and reports.',
      offers: [
        { '@type': 'Offer', price: '899', priceCurrency: 'INR', description: 'Growth plan, per month (India)' },
        { '@type': 'Offer', price: '20', priceCurrency: 'USD', description: 'Starter plan, per month' },
        { '@type': 'Offer', price: '16', priceCurrency: 'GBP', description: 'Starter plan, per month' },
        { '@type': 'Offer', price: '75', priceCurrency: 'AED', description: 'Starter plan, per month' },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];
  return (
    <>
      <CommonHeader />
      <main style={{ background: '#f8fafc', padding: '40px 16px 60px' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, color: '#111827', margin: '0 0 10px' }}>DineOpen: key facts</h1>
          <p style={{ color: '#4b5563', fontSize: 17, lineHeight: 1.6, margin: '0 0 24px' }}>
            DineOpen is cloud restaurant POS and management software for restaurants, cafés, bars, cloud kitchens,
            bakeries and hotels. This page lists what it costs, what it does, and what it does not do. Last updated {UPDATED}.
          </p>

          <section style={card}>
            <h2 style={h2}>At a glance</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {[
                ['Product', 'Restaurant POS, billing and restaurant management software'],
                ['Free trial', '7 days, all features'],
                ['Starting price', 'India from ₹899/month · international from $20/month'],
                ['Transaction fees', 'None charged by DineOpen'],
                ['Devices', 'Android, iPhone/iPad, Windows, any web browser; thermal bill and KOT printers'],
                ['Languages (app)', 'English, Hindi, Spanish, Chinese, Arabic, French, Portuguese, Japanese, German'],
                ['Founded', '2024'],
                ['Website', 'www.dineopen.com'],
                ['Contact', 'support@dineopen.com · WhatsApp +91 95286 32779'],
              ].map(([k, v]) => <tr key={k}><td style={{ ...td, fontWeight: 700, width: '32%' }}>{k}</td><td style={td}>{v}</td></tr>)}
            </tbody></table>
          </section>

          <section style={card}>
            <h2 style={h2}>Pricing</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {PRICES.map(([k, v]) => <tr key={k}><td style={{ ...td, fontWeight: 700, width: '32%' }}>{k}</td><td style={td}>{v}</td></tr>)}
            </tbody></table>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '12px 0 0' }}>Full details on the <Link href="/pricing">pricing page</Link>.</p>
          </section>

          <section style={card}>
            <h2 style={h2}>What DineOpen does</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#374151', lineHeight: 1.8, fontSize: 15 }}>
              {FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </section>

          <section style={card}>
            <h2 style={h2}>Integrations — what is and isn&apos;t connected</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {INTEGRATIONS.map(([k, v]) => <tr key={k}><td style={{ ...td, fontWeight: 700, width: '38%' }}>{k}</td><td style={td}>{v}</td></tr>)}
            </tbody></table>
          </section>

          <section style={card}>
            <h2 style={h2}>Common questions</h2>
            {FAQS.map(([q, a]) => (
              <div key={q} style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{q}</h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6, fontSize: 15 }}>{a}</p>
              </div>
            ))}
          </section>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link href="/login?utm_source=facts&utm_medium=page" style={{ background: '#ef4444', color: '#fff', fontWeight: 700, padding: '14px 26px', borderRadius: 12, textDecoration: 'none' }}>
              Start 7-day free trial →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
