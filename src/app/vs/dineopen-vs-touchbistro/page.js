import Link from 'next/link';
import Image from 'next/image';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

export const dynamic = 'force-static';
export const revalidate = false;

const TITLE = 'DineOpen vs TouchBistro 2026: Price, iPads and Add-ons Compared';
const DESCRIPTION =
  'TouchBistro starts at $69/month plus hardware and processing, with KDS, online ordering and loyalty as paid add-ons. DineOpen is $20 or $50/month on devices you own. Sourced comparison.';
const URL = 'https://www.dineopen.com/vs/dineopen-vs-touchbistro';

export const metadata = {
  title: TITLE, description: DESCRIPTION,
  keywords: 'dineopen vs touchbistro, touchbistro alternative, touchbistro pricing, ipad pos alternative, touchbistro vs dineopen',
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: 'DineOpen', images: [{ url: 'https://www.dineopen.com/billing-app-screenshot.png', width: 1200, height: 630, alt: 'DineOpen vs TouchBistro comparison' }], locale: 'en_US', type: 'article' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
  alternates: { canonical: URL },
};

// TouchBistro figures: touchbistro.com/pricing and touchbistro.com, checked 26 Nov 2026.
// DineOpen figures must match src/app/pricing/PricingClient.js (USD Starter $20, Growth $50, Pro $99 for 2 outlets).
const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How much does TouchBistro cost?', acceptedAnswer: { '@type': 'Answer', text: 'TouchBistro lists its Point of Sale plan as starting at $69/month, with hardware, payment processing and additional fees on top, and an Essentials Bundle (with integrated payments and hardware) starting at $119/month. Kitchen Display System, inventory, online ordering, loyalty and reservations are add-ons at an additional cost, priced by quote.' } },
    { '@type': 'Question', name: 'Is DineOpen cheaper than TouchBistro?', acceptedAnswer: { '@type': 'Answer', text: 'On software, yes. DineOpen Starter is $20/month ($240 a year) for one outlet with billing, KOT printing, QR ordering and basic inventory. Growth is $50/month ($600 a year) and adds KDS, an online ordering website, WhatsApp ordering, loyalty, advanced inventory and AI voice ordering. TouchBistro Point of Sale starts at $69/month ($828 a year) before hardware, processing and add-ons.' } },
    { '@type': 'Question', name: 'Does DineOpen run on iPad like TouchBistro?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. DineOpen runs in the browser on iPads, Android tablets, Windows PCs, Macs and phones, so you can use devices you already own. TouchBistro says Apple iPads are the core of its POS system.' } },
    { '@type': 'Question', name: 'Does DineOpen charge per device?', acceptedAnswer: { '@type': 'Answer', text: 'No. DineOpen plans are priced per outlet with unlimited staff accounts. Pro ($99/month) covers 2 outlets; 3 or more outlets are a custom quote.' } },
    { '@type': 'Question', name: 'Where does TouchBistro still win?', acceptedAnswer: { '@type': 'Answer', text: 'TouchBistro offers its own reservations product, restaurant-grade hardware and integrated payments from one company, and hardware financing for venues with two or more terminals. If you want one vendor for all of that, TouchBistro is a solid choice.' } },
    { '@type': 'Question', name: 'Free trial?', acceptedAnswer: { '@type': 'Answer', text: 'DineOpen has a 7-day free trial with self sign-up and no contract.' } }
  ]
};

const softwareSchemas = [{
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'DineOpen', applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android, Windows, macOS',
  offers: { '@type': 'Offer', price: '20', priceCurrency: 'USD', priceValidUntil: '2027-12-31' },
  description: 'Cloud restaurant POS for iPad, Android, Windows and Mac. Starter $20/month; Growth $50/month adds KDS, online ordering and AI voice ordering.'
}];

const articleSchema = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'DineOpen vs TouchBistro — Honest 2026 Comparison',
  description: DESCRIPTION,
  author: { '@type': 'Person', name: 'Vivek Sharma', jobTitle: 'Founder, DineOpen', url: 'https://www.dineopen.com/about' },
  publisher: { '@type': 'Organization', name: 'DineOpen', logo: { '@type': 'ImageObject', url: 'https://www.dineopen.com/favicon.png' } },
  datePublished: '2026-04-07', dateModified: '2026-11-26', mainEntityOfPage: URL,
  image: 'https://www.dineopen.com/billing-app-screenshot.png',
};

const CELL = { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' };
const ROWS = [
  ['Software, per month', 'Starter $20 · Growth $50 · Pro $99 (2 outlets)', 'Point of Sale from $69 · Essentials Bundle from $119'],
  ['On top', 'Your own card processor; DineOpen adds 0%', 'Hardware, payment processing and additional fees apply'],
  ['Devices', 'iPad, Android, Windows, Mac, phones you own', 'Apple iPads at the core, plus TouchBistro hardware'],
  ['Kitchen display (KDS)', 'Included in Growth', 'Add-on, additional cost'],
  ['Online ordering', 'Included in Growth (0% commission)', 'Add-on, additional cost'],
  ['Loyalty', 'Included in Growth', 'Add-on, additional cost'],
  ['Inventory', 'Basic in Starter, recipes + vendors in Growth', 'Add-on, additional cost'],
  ['Reservations', 'Table management only', 'Add-on, additional cost'],
  ['Trial / contract', '7-day free trial, month to month', 'Quote'],
];

const wrap = { maxWidth: '780px', margin: '0 auto', padding: '0 20px' };
const h2 = { fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: '56px 0 16px', color: '#0f172a' };
const h3 = { fontSize: '22px', fontWeight: '700', margin: '32px 0 12px', color: '#0f172a' };
const p = { fontSize: '17px', lineHeight: '1.7', color: '#1f2937', margin: '0 0 16px' };
const small = { fontSize: '14px', color: '#64748b', margin: '8px 0 24px' };
const linkStyle = { color: '#2563eb', textDecoration: 'underline', fontWeight: 500 };

export default function DineOpenVsTouchBistroPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchemas) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <CommonHeader />
      <main style={{ background: '#fff', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        <header style={{ background: 'linear-gradient(135deg,#ecfeff 0%,#f0f9ff 100%)', padding: '64px 20px 48px', borderBottom: '1px solid #a5f3fc' }}>
          <div style={wrap}>
            <div style={{ display: 'inline-block', background: '#cffafe', color: '#155e75', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, letterSpacing: '.02em' }}>COMPARISON · UPDATED 26 NOV 2026</div>
            <h1 style={{ fontSize: '44px', lineHeight: '1.1', fontWeight: '900', margin: '20px 0 16px', letterSpacing: '-0.02em' }}>
              DineOpen vs TouchBistro: what you pay and what you get
            </h1>
            <p style={{ fontSize: '19px', lineHeight: '1.6', color: '#475569', margin: '0 0 28px' }}>
              TouchBistro is an established iPad POS with its own hardware and payments. Here is what each one costs from their own pricing pages, what is included, and when TouchBistro is still the better pick.
            </p>
            <div style={{ background: '#fff', border: '2px solid #06b6d4', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 4px 14px rgba(6,182,212,.12)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0e7490', letterSpacing: '.08em', marginBottom: '8px' }}>THE SHORT ANSWER</div>
              <p style={{ ...p, margin: 0 }}>
                <strong>TouchBistro</strong> Point of Sale starts at <strong>$69/month</strong>, plus hardware, payment processing and paid add-ons for KDS, online ordering and loyalty. <strong>DineOpen</strong> is <strong>$20/month</strong> (Starter) or <strong>$50/month</strong> (Growth, with KDS, online ordering, WhatsApp ordering, loyalty and AI voice ordering), runs on the iPads, Android tablets or PCs you already have, and adds nothing to your card payments.
              </p>
            </div>
          </div>
        </header>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Price and features side by side</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', minWidth: '560px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={CELL}>&nbsp;</th><th style={CELL}>DineOpen</th><th style={CELL}>TouchBistro</th>
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
              TouchBistro: <a href="https://www.touchbistro.com/pricing/" rel="nofollow noopener" target="_blank" style={linkStyle}>touchbistro.com/pricing</a>, checked 26 Nov 2026 (they also run limited-time offers). DineOpen: <Link href="/pricing" style={linkStyle}>dineopen.com/pricing</Link>. Prices change; confirm before you sign.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>12-month software cost, one restaurant</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li><strong>TouchBistro Point of Sale:</strong> from $69 × 12 = <strong>$828</strong>, before hardware, processing and add-ons (KDS, online ordering, loyalty and inventory are quoted separately).</li>
              <li><strong>DineOpen Starter:</strong> $20 × 12 = <strong>$240</strong> (billing, KOT printing, QR ordering, basic inventory).</li>
              <li><strong>DineOpen Growth:</strong> $50 × 12 = <strong>$600</strong>, with KDS, online ordering website, WhatsApp ordering, loyalty, advanced inventory and AI voice ordering included.</li>
            </ul>
            <p style={p}>
              Card fees come on top with either system. With DineOpen you keep whichever processor gives you the best rate; DineOpen adds no percentage to it.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>What DineOpen includes</h2>
            <h3 style={h3}>Runs on devices you already own</h3>
            <p style={p}>
              iPad, Android tablet, Windows PC, Mac or phone, in the browser, with the same screens synced in real time. Priced per outlet, not per device, with unlimited staff accounts.
            </p>
            <figure style={{ margin: '24px 0' }}>
              <Image src="/billing-app-screenshot.png" alt="DineOpen billing screen with items and split payment" width={1200} height={750} style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <figcaption style={small}>The DineOpen billing screen.</figcaption>
            </figure>
            <h3 style={h3}>Billing and KOT printing (Starter)</h3>
            <p style={p}>
              Split bills, tips, service charge, multi-rate tax, voids, refunds and KOT printing to ordinary USB, network or Bluetooth thermal printers, plus QR menu and QR ordering.
            </p>
            <h3 style={h3}>Kitchen display, online ordering, loyalty (Growth)</h3>
            <p style={p}>
              Kitchen Display System, a branded online ordering website, WhatsApp ordering, customer loyalty and credit ledger, recipe-based inventory with vendors and stock alerts, a captain app for waiters, and AI voice ordering, where a waiter speaks the order and it fills the cart.
            </p>
            <h3 style={h3}>Two outlets (Pro)</h3>
            <p style={p}>
              Pro is $99/month for 2 outlets with central menu, inventory, staff and outlet-wise profit and loss. For 3 or more outlets, DineOpen gives a custom quote.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Where TouchBistro still wins</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li><strong>One company for everything.</strong> TouchBistro sells its own restaurant-grade hardware and integrated payments, with hardware financing for venues with two or more terminals.</li>
              <li><strong>Reservations.</strong> TouchBistro has its own reservations product. DineOpen has table management but no public booking widget.</li>
              <li><strong>Hands-on onboarding.</strong> If you want a sales rep to set everything up with you, TouchBistro&rsquo;s quote-led process suits that. DineOpen is self sign-up.</li>
            </ul>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Who should switch</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li>You already have tablets or PCs and don&rsquo;t want to buy new hardware</li>
              <li>You want KDS, online ordering and loyalty in the plan instead of as add-ons</li>
              <li>You want to choose your own card processor</li>
              <li>You&rsquo;re fine with self sign-up and chat support</li>
            </ul>
            <p style={p}>
              Next step: <Link href="/pricing" style={linkStyle}>see full pricing</Link>, or <Link href="/alternatives/toast" style={linkStyle}>compare against Toast</Link>.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>FAQ</h2>
            {faqSchema.mainEntity.map((q, i) => (
              <div key={i} style={{ borderTop: '1px solid #e2e8f0', padding: '18px 0' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{q.name}</div>
                <p style={{ ...p, margin: 0, color: '#334155' }}>{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: 'linear-gradient(135deg,#0e7490 0%,#06b6d4 100%)', color: '#fff', padding: '60px 20px', margin: '60px 0 0' }}>
          <div style={{ ...wrap, textAlign: 'center' }}>
            <h2 style={{ ...h2, color: '#fff', margin: '0 0 12px' }}>Try DineOpen free for 7 days</h2>
            <p style={{ ...p, color: '#cffafe', fontSize: '18px' }}>7-day free trial. Use the devices you already have. No contract.</p>
            <Link href="/login?utm_source=dineopen&utm_medium=vs&utm_campaign=touchbistro" style={{ display: 'inline-block', background: '#fff', color: '#0e7490', padding: '16px 36px', borderRadius: '999px', fontSize: '17px', fontWeight: 800, textDecoration: 'none', marginTop: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>Start free trial →</Link>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', margin: '40px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '999px', background: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, flexShrink: 0 }}>VS</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>Vivek Sharma</div>
                <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>Founder of DineOpen.</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Published April 7, 2026 · Last updated 26 Nov 2026</div>
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
