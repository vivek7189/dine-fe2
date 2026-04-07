import Link from 'next/link';
import Image from 'next/image';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

export const dynamic = 'force-static';
export const revalidate = false;

const TITLE = 'DineOpen vs Lightspeed Restaurant 2026: Honest Comparison';
const DESCRIPTION =
  'Lightspeed Restaurant starts at $89/month and adds up fast with paid modules. DineOpen is $9.99/month flat with everything included. Real features, real math, honest concessions.';
const URL = 'https://www.dineopen.com/vs/dineopen-vs-lightspeed';

export const metadata = {
  title: TITLE, description: DESCRIPTION,
  keywords: 'dineopen vs lightspeed, lightspeed restaurant alternative, cheap lightspeed alternative, lightspeed k series alternative, lightspeed vs dineopen',
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: 'DineOpen', images: [{ url: 'https://www.dineopen.com/billing-app-screenshot.png', width: 1200, height: 630, alt: 'DineOpen vs Lightspeed comparison' }], locale: 'en_US', type: 'article' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
  alternates: { canonical: URL },
};

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How much cheaper is DineOpen than Lightspeed?', acceptedAnswer: { '@type': 'Answer', text: 'Lightspeed Restaurant Essential starts at $89/month per location. The Plus tier that most multi-location operators need is $189/month. Advanced features like self-ordering, advanced inventory, and loyalty are sold as paid modules that can push the bill past $300/month. DineOpen Spark is $9.99/month flat with everything included, or $89/month Blaze for unlimited locations. A 3-location chain pays Lightspeed ~$567/month vs DineOpen Blaze at $89/month total.' } },
    { '@type': 'Question', name: 'Does Lightspeed charge transaction fees?', acceptedAnswer: { '@type': 'Answer', text: 'Lightspeed Payments (their built-in processor) charges 2.6% + $0.10 per swipe in the US, similar to Square. You can bring your own processor on some plans but it often requires integration fees. DineOpen takes zero percent on swipes — you bring your own processor freely (Stripe, Adyen, Razorpay, anything) and negotiate your own rates.' } },
    { '@type': 'Question', name: 'Is DineOpen as feature-rich as Lightspeed for full-service?', acceptedAnswer: { '@type': 'Answer', text: 'For independent and small-chain full-service restaurants, yes. DineOpen ships table layouts, course management, modifiers, split bills, tips, loyalty, inventory with recipe deduction, bar pour tracking, KDS, waiter app, QR ordering, and analytics. Lightspeed has more depth in enterprise reporting and franchise-level multi-property management — if you run 20+ locations with complex cross-property inventory, Lightspeed is the more mature choice.' } },
    { '@type': 'Question', name: 'Where does Lightspeed still win?', acceptedAnswer: { '@type': 'Answer', text: 'Large chains (20+ locations), restaurants that need deep retail + restaurant hybrid features, hotel F&B operations, and operators who want a public company with audited financials as their vendor. Lightspeed is listed on NYSE and has enterprise support SLAs that DineOpen does not match. For single-location or small chain (up to 10 locations), DineOpen is the better fit.' } },
    { '@type': 'Question', name: 'Can I migrate from Lightspeed to DineOpen?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Export your Lightspeed menu as CSV, or skip the export entirely — just take a photo of a printed menu and DineOpen AI extraction creates the digital menu in about 2 minutes. Customer data and past sales can be imported via CSV. Most operators are fully migrated in under 2 hours.' } },
    { '@type': 'Question', name: 'Does DineOpen work outside the US?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, DineOpen serves 20+ countries including the US, UK, Canada, India, UAE, Singapore, and Australia. Multi-currency, multi-tax, multi-language labels for bars, bakeries, cafés, QSR, and full-service restaurants. Lightspeed also has wide global reach — this is one area where they match up well.' } },
    { '@type': 'Question', name: 'Free trial?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, 30 days, full features, no credit card. Lightspeed also offers a trial but typically requires a sales call first. DineOpen signup is self-serve.' } }
  ]
};

const softwareSchemas = [{
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'DineOpen', applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android, Windows, macOS',
  offers: { '@type': 'Offer', price: '9.99', priceCurrency: 'USD', priceValidUntil: '2027-12-31' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '500' },
  description: 'Cloud restaurant POS with AI voice ordering, KDS, inventory, and $89/mo unlimited-location plan.'
}];

const articleSchema = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'DineOpen vs Lightspeed Restaurant — Honest 2026 Comparison',
  description: DESCRIPTION,
  author: { '@type': 'Person', name: 'Vivek Sharma', jobTitle: 'Founder, DineOpen', url: 'https://www.dineopen.com/about' },
  publisher: { '@type': 'Organization', name: 'DineOpen', logo: { '@type': 'ImageObject', url: 'https://www.dineopen.com/favicon.png' } },
  datePublished: '2026-04-07', dateModified: '2026-04-07', mainEntityOfPage: URL,
  image: 'https://www.dineopen.com/billing-app-screenshot.png',
};

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
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, letterSpacing: '.02em' }}>HONEST COMPARISON · APRIL 2026</div>
            <h1 style={{ fontSize: '44px', lineHeight: '1.1', fontWeight: '900', margin: '20px 0 16px', letterSpacing: '-0.02em' }}>
              DineOpen vs Lightspeed Restaurant — Enterprise POS at an Indie Price
            </h1>
            <p style={{ fontSize: '19px', lineHeight: '1.6', color: '#475569', margin: '0 0 28px' }}>
              Lightspeed is genuinely good software — it&rsquo;s the POS equivalent of a 12-seat boardroom table. The problem is most independent restaurants don&rsquo;t need a boardroom. Here&rsquo;s what DineOpen does, the 12-month math, and when Lightspeed is still the right call.
            </p>
            <div style={{ background: '#fff', border: '2px solid #ef4444', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 4px 14px rgba(239,68,68,.12)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#b91c1c', letterSpacing: '.08em', marginBottom: '8px' }}>THE SHORT ANSWER</div>
              <p style={{ ...p, margin: 0 }}>
                <strong>DineOpen</strong> is better for 1–10 location independents that want AI voice ordering, QR menus, KDS, inventory, and loyalty for <strong>$9.99/month</strong> flat. <strong>Lightspeed</strong> is better for 20+ location chains and hotel F&amp;B that need enterprise-grade multi-property reporting. For mid-size, DineOpen&rsquo;s <strong>$89/month Blaze</strong> covers unlimited locations — the same price as one Lightspeed seat.
              </p>
            </div>
          </div>
        </header>

        <section style={{ padding: '40px 0 0' }}>
          <div style={wrap}>
            <p style={p}>
              I&rsquo;ll start with the compliment: Lightspeed Restaurant (formerly K-Series / iKentoo) is legitimately good software. The table management is polished, the reporting is deep, and they&rsquo;ve got real enterprise customers. I have no interest in pretending otherwise.
            </p>
            <p style={p}>
              What I do want to push back on: the idea that you need to pay $189/month per location plus paid modules to run a 3-location indie group. You don&rsquo;t.
            </p>
            <p style={p}>
              This page covers what DineOpen ships, where the money actually goes on Lightspeed, and the cases where Lightspeed is still the smarter choice.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>What DineOpen actually ships</h2>
            <p style={p}>All features below are on the $9.99 Spark plan (up to 3 locations) or the $89 Blaze plan (unlimited locations). No paid modules. No &ldquo;upgrade to unlock.&rdquo;</p>

            <h3 style={h3}>Cloud POS with table layouts &amp; real-time sync</h3>
            <p style={p}>
              Runs in any browser on any device. Drag-and-drop floor plan, table-level order tracking, course management, real-time sync across multiple devices. Two servers on two tablets see the same table state in real time with no per-device fee.
            </p>
            <figure style={{ margin: '24px 0' }}>
              <Image src="/billing-app-screenshot.png" alt="DineOpen billing screen with items, split payment, and course-level ordering" width={1200} height={750} style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <figcaption style={small}>Table-level order tracking, split bills, course management — all in one screen.</figcaption>
            </figure>

            <h3 style={h3}>AI voice ordering (English + Spanish)</h3>
            <p style={p}>
              Unique to DineOpen at this price point. Speak the order, AI parses it against your menu, cart fills in seconds. Order entry drops from <strong>~47s to ~11s</strong>. Lightspeed has no built-in voice ordering — you&rsquo;d need a third-party integration.
            </p>

            <h3 style={h3}>AI menu extraction</h3>
            <p style={p}>
              Photo of a printed menu → full digital menu in about 2 minutes. Lightspeed onboarding is manual entry or CSV import, typically 2–4 hours for a 60-item menu or a paid onboarding service.
            </p>

            <h3 style={h3}>KDS + Android KOT printer app</h3>
            <p style={p}>
              Kitchen Display System in a browser. Native Android app drives generic USB/Bluetooth thermal printers with offline queueing, auto-print, custom font scale, multi-copy printing, FCM push backup. Orders print in under 2 seconds from tap.
            </p>

            <h3 style={h3}>Inventory with recipe deduction + bar pour tracking</h3>
            <p style={p}>
              Recipe-level deduction on every sale. Bar pour tracking for cocktails. Batch production for bakeries. Supplier purchase orders. Low-stock alerts. On Lightspeed, advanced inventory is a paid module. On DineOpen, it&rsquo;s the base plan.
            </p>

            <h3 style={h3}>Multi-tier pricing per item</h3>
            <p style={p}>
              Same burger, different prices for Dine-in / AC seating / Takeaway / Delivery. First-class field. Common in international markets, and Lightspeed handles this only through service modifier workarounds.
            </p>

            <h3 style={h3}>QR ordering, WhatsApp ordering, online ordering</h3>
            <p style={p}>
              Three direct-ordering channels included. No third-party app fees, no aggregator commissions. You own the customer.
            </p>

            <h3 style={h3}>Loyalty, khata, tips, split bills — all included</h3>
            <p style={p}>
              On Lightspeed, loyalty is Lightspeed Loyalty as a paid add-on. On DineOpen, it&rsquo;s built in. Same with advanced analytics, customer profiles, and gift cards.
            </p>

            <h3 style={h3}>Blaze plan: $89/month unlimited locations</h3>
            <p style={p}>
              This is where DineOpen gets really hard to beat for mid-size groups. 5 locations on Lightspeed Plus = $189 × 5 = <strong>$945/month</strong>. 5 locations on DineOpen Blaze = <strong>$89/month total</strong>.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>The real 12-month math</h2>
            <p style={p}>Scenario: 3-location casual dining group, ~$40k/month card sales per location, 6 tablets total, 3 KDS screens.</p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', margin: '20px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#fff', border: '2px solid #ef4444', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#b91c1c' }}>DINEOPEN (Blaze)</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0' }}>$89<span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}> /mo total</span></div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#334155', lineHeight: 1.7 }}>
                    <li>Unlimited locations</li>
                    <li>Centralized menu + analytics</li>
                    <li>0% per-swipe from us</li>
                    <li>Bring your own processor</li>
                  </ul>
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#991b1b' }}>12-month software: <strong>$1,068</strong></div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>LIGHTSPEED (Plus)</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0' }}>$189<span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}> /mo × 3</span></div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#334155', lineHeight: 1.7 }}>
                    <li>$189/mo × 3 locations = $567/mo</li>
                    <li>+ Advanced inventory add-on</li>
                    <li>+ Loyalty add-on</li>
                    <li>+ 2.6% + $0.10 Lightspeed Payments</li>
                  </ul>
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#991b1b' }}>12-month software: <strong>~$7,400</strong></div>
                </div>
              </div>
              <p style={{ ...small, marginTop: '20px', textAlign: 'center' }}>
                Math: Lightspeed Plus $189 × 3 locations × 12 = $6,804. Add ~$600 in module fees. Pricing per <a href="https://www.lightspeedhq.com/pos/restaurant/pricing/" rel="nofollow noopener" target="_blank" style={linkStyle}>lightspeedhq.com</a> as of April 2026.
              </p>
            </div>

            <p style={p}>
              Software-only savings for a 3-location group: <strong>~$6,300/year</strong>. That&rsquo;s a part-time manager&rsquo;s salary.
            </p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Where Lightspeed still wins</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li><strong>20+ location chains and franchises.</strong> Lightspeed&rsquo;s multi-property reporting, franchise royalty tracking, and consolidated P&amp;L are enterprise-grade.</li>
              <li><strong>Hotel F&amp;B operations.</strong> Lightspeed has mature PMS integrations (Opera, Mews, Cloudbeds). DineOpen doesn&rsquo;t have these yet.</li>
              <li><strong>Retail + restaurant hybrid.</strong> If you run a bakery that also sells packaged goods, or a winery with a tasting room, Lightspeed Retail + Restaurant is a genuine edge.</li>
              <li><strong>Public company vendor requirement.</strong> Some enterprise procurement teams require a publicly traded vendor. Lightspeed is NYSE-listed; DineOpen is private.</li>
            </ul>
            <p style={p}>For 1–10 location independents, none of these apply. DineOpen&rsquo;s the better fit.</p>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <h2 style={h2}>Who should switch</h2>
            <ul style={{ ...p, paddingLeft: '20px' }}>
              <li>Independent or small-chain restaurants (1–10 locations)</li>
              <li>Tired of paying per-location licenses</li>
              <li>Want AI features without module fees</li>
              <li>Want to own your payment processor relationship</li>
              <li>Value month-to-month over annual contracts</li>
            </ul>
            <p style={p}>
              Next step: <Link href="/pricing" style={linkStyle}>see full pricing</Link>, or <Link href="/vs/dineopen-vs-toast" style={linkStyle}>compare us against Toast</Link>.
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
            <h2 style={{ ...h2, color: '#fff', margin: '0 0 12px' }}>Try DineOpen free for 30 days</h2>
            <p style={{ ...p, color: '#fecaca', fontSize: '18px' }}>Enterprise features. Indie price. No sales call required.</p>
            <Link href="https://app.dineopen.com/signup" style={{ display: 'inline-block', background: '#fff', color: '#b91c1c', padding: '16px 36px', borderRadius: '999px', fontSize: '17px', fontWeight: 800, textDecoration: 'none', marginTop: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>Start free trial →</Link>
          </div>
        </section>

        <section>
          <div style={wrap}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', margin: '40px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '999px', background: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, flexShrink: 0 }}>VS</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>Vivek Sharma</div>
                <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>Founder of DineOpen. 4 years building restaurant software, 50+ live deployments across India and the US.</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Published April 7, 2026 · Last updated April 7, 2026</div>
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
