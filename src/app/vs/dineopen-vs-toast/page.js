import Link from 'next/link';
import Image from 'next/image';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

export const dynamic = 'force-static';
export const revalidate = false;

// =============================================================================
// /vs/dineopen-vs-toast — Built strictly to the 10 Golden Rules + template:
//   1 page = 1 person (independent US restaurant owner evaluating Toast)
//   Quick Answer in first 100 words
//   Real DineOpen features only — we don't trash Toast, we showcase ourselves
//   Real pricing ($20 Starter / $99 Pro) highlighted vs Toast's published rates
//   Hooks, screenshots, FAQ, internal links, author box, schema
// =============================================================================

const TITLE = 'DineOpen vs Toast 2026: Pricing, Card Fees and Features Compared';
const DESCRIPTION =
  'Toast: $0 Starter Kit or $69/month Point of Sale at 2.49% + 15¢ in person, Toast Payments and hardware required. DineOpen: $20 or $50/month, your own processor and devices. Sourced comparison.';
const URL = 'https://www.dineopen.com/vs/dineopen-vs-toast';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'dineopen vs toast, toast pos alternative, toast vs dineopen, restaurant pos comparison usa, toast pricing 2026, toast alternative',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/billing-app-screenshot.png', width: 1200, height: 630, alt: 'DineOpen vs Toast comparison' }],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: { canonical: URL },
};

// Toast figures from Toast's own pages (pos.toasttab.com/shop/pricing-plan, /shop/starter-kit, Toast support
// country article), same sources as /alternatives/toast, checked 22 Nov 2026.
// DineOpen figures must match src/app/pricing/PricingClient.js (USD Starter $20, Growth $50, Pro $99 for 2 outlets, 3+ custom).
const FAQ = [
  ['How much does Toast cost?', 'Toast has a $0/month Starter Kit (1–2 terminals, one location, higher card rate) and a $69/month Point of Sale plan where in-person card payments cost 2.49% + 15¢. Larger setups are quoted. Toast Payments and Toast hardware are part of the package.'],
  ['Is DineOpen cheaper than Toast?', 'On software, yes: DineOpen Starter is $20/month ($240 a year) and Growth is $50/month ($600 a year), against $828 a year for Toast Point of Sale. DineOpen adds no percentage to card payments; you pay only your own processor’s rate. Toast card rates are set by Toast Payments.'],
  ['What is in each DineOpen plan?', 'Starter ($20): billing, KOT printing, table layout, QR menu and QR ordering, basic inventory, unlimited staff accounts. Growth ($50): adds Kitchen Display System, an online ordering website, WhatsApp ordering, loyalty and credit ledger, recipe-based inventory, a captain app and AI voice ordering. Pro ($99): 2 outlets with central menu, stock and reports. 3 or more outlets: custom quote.'],
  ['Can I use my own iPads or tablets?', 'Yes. DineOpen runs in the browser on iPads, Android tablets, Windows PCs and Macs, and prints to ordinary thermal printers. Toast sells its own hardware.'],
  ['Where does Toast still win?', 'Toast gives you payments, hardware, payroll and lending from one company, with a large US sales and support team. If you want all of that from one vendor, Toast is a strong choice.'],
  ['Which countries does Toast sell in?', 'Toast says it is available in the US, Canada, the UK, Ireland and Australia. DineOpen works worldwide with local currency and tax.'],
  ['Is there a contract or free trial?', 'DineOpen is month to month with a 7-day free trial and self sign-up. Toast terms depend on the plan and quote.'],
];
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

const CELL = { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' };
const ROWS = [
  ['Software, per month', 'Starter $20 · Growth $50 · Pro $99 (2 outlets)', 'Starter Kit $0 · Point of Sale $69 · larger setups quoted'],
  ['Card payments', 'Your own processor; DineOpen adds 0%', 'Toast Payments; 2.49% + 15¢ in person on Point of Sale, higher on Starter Kit'],
  ['Hardware', 'iPads, Android tablets, PCs you already own', 'Toast hardware'],
  ['Kitchen display (KDS)', 'Growth plan', 'Available'],
  ['Online ordering', 'Growth plan, 0% commission', 'Available'],
  ['AI voice ordering', 'Growth plan', 'Check with Toast'],
  ['Payroll, lending', 'Not offered', 'Toast Payroll, Toast Capital'],
  ['Countries', 'Worldwide, local tax and currency', 'US, Canada, UK, Ireland, Australia'],
  ['Contract / trial', 'Month to month, 7-day free trial', 'Depends on plan and quote'],
];

const softwareSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DineOpen',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android, Windows, macOS',
    offers: {
      '@type': 'Offer',
      price: '20',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
    },
    description: 'Cloud restaurant POS. Starter $20/month; Growth $50/month adds KDS, online ordering and AI voice ordering. No percentage added to card payments.',
  },
];

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'DineOpen vs Toast 2026: Pricing, Card Fees and Features Compared',
  description: DESCRIPTION,
  author: {
    '@type': 'Person',
    name: 'Vivek Sharma',
    jobTitle: 'Founder, DineOpen',
    url: 'https://www.dineopen.com/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'DineOpen',
    logo: { '@type': 'ImageObject', url: 'https://www.dineopen.com/favicon.png' },
  },
  datePublished: '2026-04-07',
  dateModified: '2026-11-28',
  mainEntityOfPage: URL,
  image: 'https://www.dineopen.com/billing-app-screenshot.png',
};

// ---------- Tiny inline style helpers (server component, no CSS module) ------
const wrap = { maxWidth: '780px', margin: '0 auto', padding: '0 20px' };
const h2 = { fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: '56px 0 16px', color: '#0f172a' };
const h3 = { fontSize: '22px', fontWeight: '700', margin: '32px 0 12px', color: '#0f172a' };
const p = { fontSize: '17px', lineHeight: '1.7', color: '#1f2937', margin: '0 0 16px' };
const small = { fontSize: '14px', color: '#64748b', margin: '8px 0 24px' };
const linkStyle = { color: '#2563eb', textDecoration: 'underline', fontWeight: 500 };

export default function DineOpenVsToastPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchemas) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <CommonHeader />

      <main style={{ background: '#fff', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* ============ HERO ============ */}
        <header style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#fef2f2 100%)', padding: '64px 20px 48px', borderBottom: '1px solid #fde68a' }}>
          <div style={wrap}>
            <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, letterSpacing: '.02em' }}>
              COMPARISON · UPDATED 28 NOV 2026
            </div>
            <h1 style={{ fontSize: '44px', lineHeight: '1.1', fontWeight: '900', margin: '20px 0 16px', letterSpacing: '-0.02em' }}>
              DineOpen vs Toast: what you pay and what you get
            </h1>
            <p style={{ fontSize: '19px', lineHeight: '1.6', color: '#475569', margin: '0 0 28px' }}>
              Toast is a strong all-in-one platform with its own payments and hardware. DineOpen is software only, on devices you already have, with the card processor you choose. Here are the prices from both companies&rsquo; own pages, and when Toast is still the better pick.
            </p>

            {/* QUICK ANSWER BOX */}
            <div style={{ background: '#fff', border: '2px solid #f59e0b', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 4px 14px rgba(245,158,11,.12)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#b45309', letterSpacing: '.08em', marginBottom: '8px' }}>THE SHORT ANSWER</div>
              <p style={{ ...p, margin: 0, fontSize: '17px' }}>
                <strong>Toast</strong> is $0/month (Starter Kit, higher card rate) or <strong>$69/month</strong> (Point of Sale, <strong>2.49% + 15¢</strong> per in-person card payment), with Toast Payments and Toast hardware. <strong>DineOpen</strong> is <strong>$20/month</strong> (Starter) or <strong>$50/month</strong> (Growth, with KDS, online ordering and AI voice ordering), runs on your own devices, and adds nothing to your card payments. Choose Toast if you want payments, hardware, payroll and lending from one company.
              </p>
            </div>
          </div>
        </header>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Side by side</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', minWidth: '560px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={CELL}>&nbsp;</th><th style={CELL}>DineOpen</th><th style={CELL}>Toast</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r[0]}><td style={{ ...CELL, fontWeight: 600 }}>{r[0]}</td><td style={CELL}>{r[1]}</td><td style={CELL}>{r[2]}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={small}>
              Toast: <a href="https://pos.toasttab.com/shop/pricing-plan" rel="nofollow noopener" target="_blank" style={linkStyle}>pricing plans</a>, <a href="https://pos.toasttab.com/shop/starter-kit" rel="nofollow noopener" target="_blank" style={linkStyle}>Starter Kit</a>, <a href="https://support.toasttab.com/en/article/Toast-Product-Availability-in-Australia-Canada-Ireland-and-the-United-Kingdom" rel="nofollow noopener" target="_blank" style={linkStyle}>country availability</a>, checked 22 Nov 2026. DineOpen: <Link href="/pricing" style={linkStyle}>dineopen.com/pricing</Link>. Prices change; confirm before you sign.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>12-month software cost, one restaurant</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li><strong>Toast Point of Sale:</strong> $69 × 12 = <strong>$828</strong>, plus Toast hardware.</li>
              <li><strong>DineOpen Starter:</strong> $20 × 12 = <strong>$240</strong>.</li>
              <li><strong>DineOpen Growth:</strong> $50 × 12 = <strong>$600</strong>, with KDS, online ordering, WhatsApp ordering, loyalty and AI voice ordering.</li>
            </ul>
            <p style={p}>
              <strong>Card fees come on top with both.</strong> With Toast, the rate is set by Toast Payments (2.49% + 15¢ in person on Point of Sale). With DineOpen you keep whichever processor gives you the best rate, and DineOpen adds no percentage to it. At $40,000 a month in card sales, every 0.1% you save on your rate is $40 a month.
            </p>
            <h3 style={h3}>Two or more outlets</h3>
            <p style={p}>
              DineOpen Pro is $99/month for 2 outlets, with central menu, stock, staff and outlet-wise profit and loss. For 3 or more outlets, DineOpen gives a custom quote; Toast quotes larger setups too.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>What DineOpen includes</h2>
            <h3 style={h3}>Starter, $20/month</h3>
            <p style={p}>
              Billing with split bills, tips, service charge, discounts and multi-rate sales tax; refunds and voids; KOT printing to ordinary USB, network or Bluetooth thermal printers; table layout; QR menu and QR ordering from the table; basic inventory; unlimited staff accounts. It runs in the browser on iPads, Android tablets, Windows PCs and Macs.
            </p>
            <figure style={{ margin: '24px 0' }}>
              <Image src="/billing-app-screenshot.png" alt="DineOpen billing screen with items, taxes and split payment" width={1200} height={750} style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <figcaption style={small}>The DineOpen billing screen.</figcaption>
            </figure>
            <h3 style={h3}>Growth, $50/month</h3>
            <p style={p}>
              Everything in Starter plus a Kitchen Display System, a branded online ordering website (no commission), WhatsApp ordering, customer loyalty and credit ledger, recipe-based inventory with vendors and stock alerts, a captain app for waiters, and AI voice ordering, where a waiter speaks the order and it fills the cart.
            </p>
            <h3 style={h3}>Quick setup</h3>
            <p style={p}>
              Upload your menu as a photo, PDF or spreadsheet and DineOpen builds the digital menu for you to check. Sign up yourself and try it free for 7 days.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Where Toast still wins</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li><strong>One company for everything.</strong> Payments, hardware, payroll (Toast Payroll) and lending (Toast Capital). DineOpen does not offer payroll processing or lending.</li>
              <li><strong>On-site help.</strong> Toast has a large US sales and installation team. DineOpen is self sign-up with chat support.</li>
              <li><strong>Integrations.</strong> Toast has a large partner marketplace. DineOpen covers the core: payments, delivery-app sync for some platforms, and report exports.</li>
            </ul>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Who should choose DineOpen</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li>One or two outlets, or a small group happy with a custom quote</li>
              <li>You already have iPads, Android tablets or PCs</li>
              <li>You want to choose your own card processor</li>
              <li>You want KDS and online ordering for $50 a month</li>
              <li>You&rsquo;re fine with self sign-up and chat support</li>
            </ul>
            <p style={p}>
              Next: <Link href="/pricing" style={linkStyle}>see full pricing</Link>, read <Link href="/alternatives/toast" style={linkStyle}>Toast pricing explained</Link>, or see the <Link href="/pos/usa" style={linkStyle}>US page</Link> for sales tax and tipping.
            </p>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section>
          <div style={wrap}>
            <h2 style={h2}>FAQ — the questions people ask before switching</h2>
            {faqSchema.mainEntity.map((q, i) => (
              <div key={i} style={{ borderTop: '1px solid #e2e8f0', padding: '18px 0' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{q.name}</div>
                <p style={{ ...p, margin: 0, color: '#334155' }}>{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section style={{ background: 'linear-gradient(135deg,#1e40af 0%,#2563eb 100%)', color: '#fff', padding: '60px 20px', margin: '60px 0 0' }}>
          <div style={{ ...wrap, textAlign: 'center' }}>
            <h2 style={{ ...h2, color: '#fff', margin: '0 0 12px' }}>Try DineOpen free for 7 days</h2>
            <p style={{ ...p, color: '#dbeafe', fontSize: '18px' }}>
              7-day free trial. No contract. Use the devices you already have.
            </p>
            <Link href="/login?utm_source=dineopen&utm_medium=vs&utm_campaign=toast" style={{
              display: 'inline-block', background: '#fff', color: '#1e40af', padding: '16px 36px',
              borderRadius: '999px', fontSize: '17px', fontWeight: 800, textDecoration: 'none', marginTop: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,.18)'
            }}>
              Start free trial →
            </Link>
          </div>
        </section>

        {/* ============ AUTHOR BOX ============ */}
        <section>
          <div style={wrap}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', margin: '40px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '999px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, flexShrink: 0 }}>VS</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Vivek Sharma</div>
                <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                  Founder of DineOpen.
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                  Published April 7, 2026 · Last updated 28 Nov 2026
                </div>
              </div>
            </div>
          </div>
        </section>

        <InternalLinks />
      </main>

      <Footer />
    </>
  );
}
