import Link from 'next/link';
import Image from 'next/image';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

export const dynamic = 'force-static';
export const revalidate = false;

const TITLE = 'DineOpen vs Lightspeed Restaurant 2026: Price and Features Compared';
const DESCRIPTION =
  'Lightspeed Restaurant is priced from $189/month on its own pages. DineOpen is $20 or $50/month for one outlet, $99 for two, on devices you own. What each includes and when Lightspeed wins.';
const URL = 'https://www.dineopen.com/vs/dineopen-vs-lightspeed';

export const metadata = {
  title: TITLE, description: DESCRIPTION,
  keywords: 'dineopen vs lightspeed, lightspeed restaurant alternative, lightspeed restaurant pricing, lightspeed k series alternative, lightspeed vs dineopen',
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: 'DineOpen', images: [{ url: 'https://www.dineopen.com/billing-app-screenshot.png', width: 1200, height: 630, alt: 'DineOpen vs Lightspeed comparison' }], locale: 'en_US', type: 'article' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
  alternates: { canonical: URL },
};

// Lightspeed: "from $189/month" as stated on lightspeedhq.com restaurant pages (QSR / fine dining), seen 26 Nov 2026;
// their pricing page blocks automated checks, so no other Lightspeed figures are stated here.
// DineOpen figures must match src/app/pricing/PricingClient.js (USD Starter $20, Growth $50, Pro $99 for 2 outlets, 3+ custom).
const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How much does Lightspeed Restaurant cost?', acceptedAnswer: { '@type': 'Answer', text: 'Lightspeed’s restaurant pages state pricing from $189/month for Lightspeed Hospitality. Plan details, add-ons and payments are on Lightspeed’s pricing page or by quote, so confirm the full cost with Lightspeed before you sign.' } },
    { '@type': 'Question', name: 'How much cheaper is DineOpen than Lightspeed?', acceptedAnswer: { '@type': 'Answer', text: 'For one restaurant, DineOpen Growth is $50/month ($600 a year) with KDS, online ordering, WhatsApp ordering, loyalty, recipe inventory and AI voice ordering. Lightspeed from $189/month is $2,268 a year. DineOpen Starter is $20/month ($240 a year) if you only need billing, KOT printing, QR ordering and basic inventory. Pro is $99/month for 2 outlets; 3 or more outlets are a custom quote.' } },
    { '@type': 'Question', name: 'Does DineOpen take a cut of card payments?', acceptedAnswer: { '@type': 'Answer', text: 'No. DineOpen adds no percentage to your card payments. You use the card processor you choose and pay its rate.' } },
    { '@type': 'Question', name: 'Where does Lightspeed still win?', acceptedAnswer: { '@type': 'Answer', text: 'Larger groups and franchises that need deep multi-location reporting, hotel F&B teams that need property-system integrations, retail plus restaurant businesses, and buyers who need a publicly listed vendor. For one or two outlets, DineOpen covers the daily work for less.' } },
    { '@type': 'Question', name: 'Can I move my menu from Lightspeed to DineOpen?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Import your menu from a spreadsheet, or upload a photo or PDF of your menu and DineOpen builds the digital menu for you to check.' } },
    { '@type': 'Question', name: 'Free trial?', acceptedAnswer: { '@type': 'Answer', text: 'DineOpen has a 7-day free trial with self sign-up and no contract.' } }
  ]
};

const softwareSchemas = [{
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'DineOpen', applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android, Windows, macOS',
  offers: { '@type': 'Offer', price: '20', priceCurrency: 'USD', priceValidUntil: '2027-12-31' },
  description: 'Cloud restaurant POS. Starter $20/month; Growth $50/month adds KDS, online ordering and AI voice ordering; Pro $99/month for 2 outlets.'
}];

const articleSchema = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'DineOpen vs Lightspeed Restaurant — Honest 2026 Comparison',
  description: DESCRIPTION,
  author: { '@type': 'Person', name: 'Vivek Sharma', jobTitle: 'Founder, DineOpen', url: 'https://www.dineopen.com/about' },
  publisher: { '@type': 'Organization', name: 'DineOpen', logo: { '@type': 'ImageObject', url: 'https://www.dineopen.com/favicon.png' } },
  datePublished: '2026-04-07', dateModified: '2026-11-26', mainEntityOfPage: URL,
  image: 'https://www.dineopen.com/billing-app-screenshot.png',
};

const CELL = { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' };

const wrap = { maxWidth: '780px', margin: '0 auto', padding: '0 20px' };
const h2 = { fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: '56px 0 16px', color: '#0f172a' };
const h3 = { fontSize: '22px', fontWeight: '700', margin: '32px 0 12px', color: '#0f172a' };
const p = { fontSize: '17px', lineHeight: '1.7', color: '#1f2937', margin: '0 0 16px' };
const small = { fontSize: '14px', color: '#64748b', margin: '8px 0 24px' };
const linkStyle = { color: '#2563eb', textDecoration: 'underline', fontWeight: 500 };

export default function DineOpenVsLightspeedPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchemas) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <CommonHeader />
      <main style={{ background: '#fff', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        <header style={{ background: 'linear-gradient(135deg,#fef3f2 0%,#fff7ed 100%)', padding: '64px 20px 48px', borderBottom: '1px solid #fecaca' }}>
          <div style={wrap}>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, letterSpacing: '.02em' }}>COMPARISON · UPDATED 26 NOV 2026</div>
            <h1 style={{ fontSize: '44px', lineHeight: '1.1', fontWeight: '900', margin: '20px 0 16px', letterSpacing: '-0.02em' }}>
              DineOpen vs Lightspeed Restaurant: price, features and fit
            </h1>
            <p style={{ fontSize: '19px', lineHeight: '1.6', color: '#475569', margin: '0 0 28px' }}>
              Lightspeed Restaurant (formerly K-Series) is strong software built for bigger operations. Here is what each costs, what is included, and when Lightspeed is still the right call.
            </p>
            <div style={{ background: '#fff', border: '2px solid #ef4444', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 4px 14px rgba(239,68,68,.12)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#b91c1c', letterSpacing: '.08em', marginBottom: '8px' }}>THE SHORT ANSWER</div>
              <p style={{ ...p, margin: 0 }}>
                <strong>Lightspeed</strong> states pricing from <strong>$189/month</strong>. <strong>DineOpen</strong> is <strong>$20/month</strong> (Starter) or <strong>$50/month</strong> (Growth, with KDS, online ordering, WhatsApp ordering, loyalty and AI voice ordering) for one outlet, and <strong>$99/month</strong> (Pro) for two. It runs on devices you already own and adds nothing to card payments. Lightspeed suits larger groups, hotels and retail-plus-restaurant businesses.
              </p>
            </div>
          </div>
        </header>

        <section>
          <div style={wrap}>
            <h2 style={h2}>12-month software cost</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', minWidth: '520px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={CELL}>Setup</th><th style={CELL}>DineOpen</th><th style={CELL}>Lightspeed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ ...CELL, fontWeight: 600 }}>1 restaurant, basic POS</td><td style={CELL}>Starter $20 × 12 = <strong>$240</strong></td><td style={CELL}>From $189 × 12 = <strong>$2,268</strong></td></tr>
                  <tr><td style={{ ...CELL, fontWeight: 600 }}>1 restaurant with KDS + online ordering</td><td style={CELL}>Growth $50 × 12 = <strong>$600</strong></td><td style={CELL}>From $2,268, plus any add-ons in your quote</td></tr>
                  <tr><td style={{ ...CELL, fontWeight: 600 }}>2 outlets</td><td style={CELL}>Pro $99 × 12 = <strong>$1,188</strong></td><td style={CELL}>Ask Lightspeed for a multi-location quote</td></tr>
                  <tr><td style={{ ...CELL, fontWeight: 600 }}>3+ outlets</td><td style={CELL}>Custom quote</td><td style={CELL}>Quote</td></tr>
                </tbody>
              </table>
            </div>
            <p style={small}>
              Lightspeed: &ldquo;from $189/month&rdquo; as stated on <a href="https://www.lightspeedhq.com/pos/restaurant/quick-service-restaurant-pos/" rel="nofollow noopener" target="_blank" style={linkStyle}>lightspeedhq.com</a>, seen 26 Nov 2026; full plans on their <a href="https://www.lightspeedhq.com/pos/restaurant/pricing/" rel="nofollow noopener" target="_blank" style={linkStyle}>pricing page</a>. DineOpen: <Link href="/pricing" style={linkStyle}>dineopen.com/pricing</Link>. Card fees come on top with either; DineOpen adds no percentage to yours. Prices change; confirm before you sign.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>What DineOpen includes</h2>
            <h3 style={h3}>Starter, $20/month</h3>
            <p style={p}>
              Billing with split bills, tips, service charge and multi-rate tax; KOT printing to ordinary thermal printers; table layout; QR menu and QR ordering; basic inventory; unlimited staff accounts. Runs in the browser on iPads, Android tablets, Windows PCs and Macs, with no per-device fee.
            </p>
            <figure style={{ margin: '24px 0' }}>
              <Image src="/billing-app-screenshot.png" alt="DineOpen billing screen with items and split payment" width={1200} height={750} style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <figcaption style={small}>The DineOpen billing screen.</figcaption>
            </figure>
            <h3 style={h3}>Growth, $50/month</h3>
            <p style={p}>
              Everything in Starter plus Kitchen Display System, a branded online ordering website, WhatsApp ordering, customer loyalty and credit ledger, recipe-based inventory with vendors and stock alerts, a captain app for waiters, and AI voice ordering, where a waiter speaks the order and it fills the cart.
            </p>
            <h3 style={h3}>Pro, $99/month for 2 outlets</h3>
            <p style={p}>
              Everything in Growth plus a chain dashboard: central menu, inventory and staff, cross-outlet reports and outlet-wise profit and loss. For 3 or more outlets, DineOpen gives a custom quote.
            </p>
            <h3 style={h3}>Prices per item by order type</h3>
            <p style={p}>
              One dish can have different prices for dine-in, takeaway and delivery, set once on the item.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Where Lightspeed still wins</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li><strong>Large groups and franchises.</strong> Lightspeed has deeper multi-location reporting and enterprise support.</li>
              <li><strong>Hotel F&amp;B.</strong> Lightspeed integrates with hotel property-management systems. DineOpen does not offer these yet.</li>
              <li><strong>Retail plus restaurant.</strong> If you also run a shop, Lightspeed Retail alongside Restaurant is a real advantage.</li>
              <li><strong>Listed vendor.</strong> Some procurement teams require a publicly traded vendor. Lightspeed is listed; DineOpen is private.</li>
            </ul>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Who should switch</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li>One or two outlets that don&rsquo;t need enterprise reporting</li>
              <li>You want KDS, online ordering and loyalty in a $50 plan</li>
              <li>You want to choose your own card processor</li>
              <li>You prefer month to month with self sign-up</li>
            </ul>
            <p style={p}>
              Next step: <Link href="/pricing" style={linkStyle}>see full pricing</Link>, or <Link href="/alternatives/toast" style={linkStyle}>compare us against Toast</Link>.
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

        <section style={{ background: 'linear-gradient(135deg,#b91c1c 0%,#ef4444 100%)', color: '#fff', padding: '60px 20px', margin: '60px 0 0' }}>
          <div style={{ ...wrap, textAlign: 'center' }}>
            <h2 style={{ ...h2, color: '#fff', margin: '0 0 12px' }}>Try DineOpen free for 7 days</h2>
            <p style={{ ...p, color: '#fecaca', fontSize: '18px' }}>7-day free trial. No contract. No sales call required.</p>
            <Link href="/login?utm_source=dineopen&utm_medium=vs&utm_campaign=lightspeed" style={{ display: 'inline-block', background: '#fff', color: '#b91c1c', padding: '16px 36px', borderRadius: '999px', fontSize: '17px', fontWeight: 800, textDecoration: 'none', marginTop: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>Start free trial →</Link>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', margin: '40px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '999px', background: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, flexShrink: 0 }}>VS</div>
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
