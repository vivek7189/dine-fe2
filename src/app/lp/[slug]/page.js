import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FaReceipt, FaUtensils, FaChair, FaQrcode, FaBoxes, FaChartBar, FaUsers, FaStar, FaFileInvoice, FaMotorcycle,
  FaWhatsapp, FaCheck, FaAndroid, FaApple, FaWindows, FaGlobe, FaPrint,
} from 'react-icons/fa';
import { LP_VARIANTS } from '../variants';
import LPTracker from './LPTracker';
import LPStart from './LPStart';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LP_VARIANTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const v = LP_VARIANTS[slug];
  if (!v) return {};
  // Paid-traffic page: kept out of search so it never competes with the SEO pages.
  return { title: v.title, description: v.description, robots: { index: false, follow: true } };
}

const ICONS = { receipt: FaReceipt, kitchen: FaUtensils, tables: FaChair, qr: FaQrcode, box: FaBoxes, chart: FaChartBar, users: FaUsers, star: FaStar, gst: FaFileInvoice, bike: FaMotorcycle };

const money = (cur, n) => `${cur}${n.toLocaleString('en-IN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

function BillMock({ bill }) {
  const sub = bill.items.reduce((s, [, q, p]) => s + q * p, 0);
  const taxes = bill.taxes.map(([n, r]) => [n, Math.round(sub * r * 100) / 100]);
  const total = sub + taxes.reduce((s, [, t]) => s + t, 0);
  return (
    <div className="lp-mock" aria-label="Example bill in DineOpen">
      <div className="lp-bill">
        <div className="lp-bill-h"><b>{bill.title}</b><span>Running</span></div>
        {bill.items.map(([n, q, p]) => (
          <div className="lp-row" key={n}><span>{q} × {n}</span><b>{money(bill.currency, q * p)}</b></div>
        ))}
        <div className="lp-row lp-muted lp-sep"><span>Subtotal</span><span>{money(bill.currency, sub)}</span></div>
        {taxes.map(([n, t]) => <div className="lp-row lp-muted" key={n}><span>{n}</span><span>{money(bill.currency, t)}</span></div>)}
        <div className="lp-row lp-total"><span>Total</span><span>{money(bill.currency, total)}</span></div>
        <div className="lp-pay">{bill.pay.map((p) => <span key={p}>{p}</span>)}</div>
        <div className="lp-bill-acts"><span className="lp-a1">Print bill</span><span className="lp-a2"><FaWhatsapp /> Send</span></div>
      </div>
      <div className="lp-kot">
        {bill.kot.map((l, i) => <div key={l} className={i === 0 ? 'lp-kot-h' : ''}>{l}</div>)}
      </div>
      <p className="lp-mock-note">Example bill</p>
    </div>
  );
}

function WhatsAppLink({ v, className, children }) {
  return (
    <a className={className} href={`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(v.whatsappText)}`}
      target="_blank" rel="noopener noreferrer" data-lp-cta="whatsapp">
      {children}
    </a>
  );
}

export default async function LandingPage({ params }) {
  const { slug } = await params;
  const v = LP_VARIANTS[slug];
  if (!v) notFound();
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: v.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  return (
    <main className="lp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <LPTracker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="lp-top">
        <div className="lp-wrap lp-top-in">
          <Link href="/" className="lp-logo"><img src="/favicon.svg" alt="" width={30} height={30} /> DineOpen</Link>
          <div className="lp-top-r">
            <WhatsAppLink v={v} className="lp-top-wa"><FaWhatsapp /> <span>WhatsApp</span></WhatsAppLink>
            <Link href="/login" className="lp-login">Log in</Link>
          </div>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-wrap lp-hero-in">
          <div className="lp-copy" id="start">
            <div className="lp-eyebrow">{v.eyebrow}</div>
            <h1>{v.h1}</h1>
            <p className="lp-sub">{v.sub}</p>
            <LPStart slug={slug} dial={v.dial} id="lp-phone-top" />
            <ul className="lp-ticks">{v.ticks.map((t) => <li key={t}><FaCheck /> {t}</li>)}</ul>
            <p className="lp-alt">Prefer to talk first? <WhatsAppLink v={v} className="lp-alt-wa">WhatsApp us and we’ll set up your menu free</WhatsAppLink></p>
          </div>
          <BillMock bill={v.bill} />
        </div>
      </section>

      <section className="lp-devices">
        <div className="lp-wrap lp-devices-in">
          <span><FaAndroid /> Android</span><span><FaApple /> iPhone &amp; iPad</span><span><FaWindows /> Windows</span><span><FaGlobe /> Any browser</span><span><FaPrint /> 58/80 mm printers · Bluetooth, USB, LAN</span>
        </div>
      </section>

      <section className="lp-wrap lp-sec">
        <h2>Why owners switch to DineOpen</h2>
        <div className="lp-benefits">
          {v.benefits.map(([t, d], i) => (
            <div key={t} className="lp-benefit"><i>{i + 1}</i><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="lp-wrap lp-sec">
        <h2>Everything your restaurant needs, in one app</h2>
        <div className="lp-feats">
          {v.features.map(([ic, t, d]) => {
            const Icon = ICONS[ic] || FaCheck;
            return (
              <div key={t} className="lp-feat"><span className="lp-ic"><Icon /></span><div><h3>{t}</h3><p>{d}</p></div></div>
            );
          })}
        </div>
      </section>

      <section className="lp-steps-sec">
        <div className="lp-wrap lp-sec">
          <h2>Start billing today</h2>
          <div className="lp-steps">
            {[['Sign up', 'Enter your mobile number or use Google. Takes a minute.'],
              ['Add your menu', 'Type it in, import Excel, or send it on WhatsApp and we load it for you.'],
              ['Print your first bill', 'Connect your thermal printer and take your first order.']].map(([t, d], i) => (
              <div key={t} className="lp-step"><i>{i + 1}</i><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-wrap lp-sec lp-price-sec">
        <div className="lp-price">
          <div className="lp-price-k">Simple pricing</div>
          <div className="lp-price-v">{v.price}<span>{v.per}</span></div>
          <div className="lp-price-n">{v.priceNote}</div>
          <ul>{['All billing, KOT and table features', 'Free menu setup', 'Free updates and support'].map((t) => <li key={t}><FaCheck /> {t}</li>)}</ul>
          <a href="#start" className="lp-btn lp-btn-block">Start 7-day free trial →</a>
          <Link href="/pricing" className="lp-price-all">See all plans</Link>
        </div>
      </section>

      <section className="lp-wrap lp-sec lp-faq">
        <h2>Questions</h2>
        {v.faqs.map(([q, a], i) => (
          <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
        ))}
      </section>

      <section className="lp-final">
        <div className="lp-wrap">
          <h2>Try DineOpen free for 7 days</h2>
          <p>No card needed. Your menu set up free.</p>
          <LPStart slug={slug} dial={v.dial} id="lp-phone-bottom" />
        </div>
      </section>

      <div className="lp-sticky">
        <a href="#start" className="lp-btn">Start free trial</a>
        <WhatsAppLink v={v} className="lp-sticky-wa"><FaWhatsapp /> WhatsApp</WhatsAppLink>
      </div>
    </main>
  );
}

const CSS = `
.lp{--red:#ef4444;--red-d:#dc2626;--ink:#0f172a;--body:#475569;--line:#e2e8f0;--soft:#f8fafc;background:#fff;color:var(--ink);font-family:var(--font-inter),system-ui,-apple-system,sans-serif;padding-bottom:0}
.lp *{box-sizing:border-box}
.lp-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.lp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lp-top{border-bottom:1px solid #f1f5f9;background:#fff;position:sticky;top:0;z-index:20}
.lp-top-in{display:flex;justify-content:space-between;align-items:center;height:64px}
.lp-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:800;font-size:20px}
.lp-top-r{display:flex;align-items:center;gap:16px}
.lp-top-wa{display:inline-flex;align-items:center;gap:6px;color:#15803d;font-weight:700;text-decoration:none;font-size:14px}
.lp-login{color:var(--body);font-weight:600;text-decoration:none;font-size:14px}
.lp-hero{background:linear-gradient(180deg,#fff5f5 0%,#fff 100%);padding:48px 0 110px}
.lp-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:48px;align-items:center}
.lp-eyebrow{color:var(--red);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.lp h1{font-size:clamp(30px,4.4vw,48px);line-height:1.1;font-weight:900;letter-spacing:-.03em;margin:12px 0 14px}
.lp-sub{font-size:clamp(16px,1.8vw,19px);color:var(--body);line-height:1.6;margin:0 0 22px;max-width:34em}
.lp-start{display:flex;gap:10px;flex-wrap:wrap;max-width:520px}
.lp-phone{flex:1 1 240px;display:flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;background:#fff;overflow:hidden}
.lp-phone:focus-within{border-color:var(--red);box-shadow:0 0 0 4px rgba(239,68,68,.12)}
.lp-dial{padding:0 12px;font-weight:700;color:var(--ink);background:var(--soft);align-self:stretch;display:flex;align-items:center;border-right:1px solid var(--line);font-size:15px;white-space:nowrap}
.lp-phone input{flex:1;min-width:0;border:0;outline:0;padding:14px;font-size:16px;font-family:inherit;color:var(--ink);background:transparent}
.lp-btn{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:12px;padding:14px 22px;background:var(--red);color:#fff;font-weight:800;font-size:16px;cursor:pointer;text-decoration:none;font-family:inherit;min-height:50px;white-space:nowrap}
.lp-btn:hover{background:var(--red-d)}
.lp-btn-block{width:100%}
.lp-err{width:100%;margin:2px 0 0;color:var(--red-d);font-size:13.5px;font-weight:600}
.lp-ticks{list-style:none;padding:0;margin:16px 0 0;display:flex;flex-wrap:wrap;gap:8px 18px}
.lp-ticks li{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--ink)}
.lp-ticks svg{color:#16a34a}
.lp-alt{margin:16px 0 0;font-size:14px;color:var(--body)}
.lp-alt-wa{color:#15803d;font-weight:700}
.lp-mock{position:relative;max-width:420px;justify-self:center;width:100%}
.lp-bill{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;box-shadow:0 30px 60px -30px rgba(15,23,42,.35)}
.lp-bill-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.lp-bill-h span{font-size:12px;font-weight:700;color:#b45309;background:#fef3c7;border-radius:999px;padding:4px 10px}
.lp-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:15px;font-variant-numeric:tabular-nums}
.lp-muted{color:var(--body);font-size:14px}
.lp-sep{border-top:1px dashed var(--line);margin-top:6px;padding-top:10px}
.lp-total{border-top:1px solid var(--line);margin-top:6px;padding-top:10px;font-weight:900;font-size:19px}
.lp-pay{display:flex;gap:8px;margin-top:12px}
.lp-pay span{flex:1;text-align:center;border:1px solid var(--line);border-radius:10px;padding:8px 0;font-size:13px;font-weight:700;color:var(--body)}
.lp-pay span:nth-child(2){border-color:var(--red);color:var(--red-d);background:#fef2f2}
.lp-bill-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.lp-bill-acts span{display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;padding:11px 0;font-weight:800;font-size:14px}
.lp-a1{background:var(--ink);color:#fff}
.lp-a2{background:#dcfce7;color:#15803d}
.lp-kot{position:absolute;right:-22px;bottom:-96px;width:200px;background:#fffdf7;border:1px solid #e7e0cf;border-radius:6px;padding:12px 14px;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7;color:#1f2937;box-shadow:0 18px 40px -18px rgba(15,23,42,.45);transform:rotate(4deg)}
.lp-kot-h{font-weight:800;border-bottom:1px dashed #cbbf9f;padding-bottom:4px;margin-bottom:4px}
.lp-mock-note{position:absolute;left:4px;bottom:-26px;margin:0;font-size:12px;color:#94a3b8}
.lp-devices{border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;background:var(--soft)}
.lp-devices-in{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 28px;padding:16px 20px;font-size:14px;font-weight:600;color:var(--body)}
.lp-devices-in span{display:inline-flex;align-items:center;gap:6px}
.lp-sec{padding:64px 20px 0}
.lp h2{font-size:clamp(24px,3vw,34px);font-weight:900;letter-spacing:-.02em;text-align:center;margin:0 0 28px}
.lp h3{font-size:17px;margin:0 0 6px;font-weight:800}
.lp p{line-height:1.6}
.lp-benefits{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.lp-benefit{border:1px solid var(--line);border-radius:18px;padding:22px}
.lp-benefit i,.lp-step i{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#fef2f2;color:var(--red);font-style:normal;font-weight:900;margin-bottom:12px}
.lp-benefit p,.lp-step p,.lp-feat p{margin:0;color:var(--body);font-size:15px}
.lp-feats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.lp-feat{display:flex;gap:14px;border:1px solid #f1f5f9;background:var(--soft);border-radius:16px;padding:18px}
.lp-feat p{font-size:14px}
.lp-ic{flex-shrink:0;width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid var(--line);display:grid;place-items:center;color:var(--red)}
.lp-steps-sec{background:var(--soft);margin-top:64px;padding-bottom:64px}
.lp-steps-sec .lp-sec{padding-top:56px}
.lp-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.lp-step{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}
.lp-price-sec{display:flex;justify-content:center}
.lp-price{width:100%;max-width:440px;border:2px solid var(--red);border-radius:22px;padding:28px;text-align:center}
.lp-price-k{font-weight:700;color:var(--body)}
.lp-price-v{font-size:48px;font-weight:900;letter-spacing:-.03em;margin:4px 0}
.lp-price-v span{font-size:18px;color:var(--body);font-weight:600}
.lp-price-n{color:var(--body);font-size:14px;margin-bottom:16px}
.lp-price ul{list-style:none;padding:0;margin:0 0 20px;text-align:left;display:grid;gap:8px}
.lp-price li{display:flex;gap:8px;align-items:center;font-size:15px;font-weight:600}
.lp-price li svg{color:#16a34a}
.lp-price-all{display:inline-block;margin-top:12px;color:var(--body);font-size:14px}
.lp-faq{max-width:820px}
.lp-faq details{border-bottom:1px solid var(--line);padding:16px 0}
.lp-faq summary{font-weight:800;cursor:pointer;font-size:16px}
.lp-faq details p{color:var(--body);margin:10px 0 0}
.lp-final{background:var(--ink);color:#fff;margin-top:64px;padding:56px 0;text-align:center}
.lp-final h2{color:#fff;margin-bottom:8px}
.lp-final p{color:#cbd5e1;margin:0 0 22px}
.lp-final .lp-start{margin:0 auto}
.lp-final .lp-err{color:#fecaca}
.lp-sticky{display:none}
@media (max-width:900px){
  .lp-hero-in{grid-template-columns:minmax(0,1fr);gap:56px}
  .lp-benefits,.lp-steps{grid-template-columns:minmax(0,1fr)}
  .lp-feats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .lp-kot{right:-6px}
}
@media (max-width:600px){
  .lp-wrap{padding:0 16px}
  .lp-sec{padding:48px 16px 0}
  .lp-hero{padding:28px 0 120px}
  .lp-top-wa span{display:none}
  .lp-feats{grid-template-columns:minmax(0,1fr)}
  .lp-btn{width:100%}
  .lp-kot{width:170px;font-size:11px;right:0;bottom:-100px}
  .lp-devices-in{justify-content:flex-start;gap:8px 16px;font-size:13px}
  .lp{padding-bottom:76px}
  .lp-sticky{display:flex;gap:10px;position:fixed;left:0;right:0;bottom:0;z-index:30;background:#fff;border-top:1px solid var(--line);padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
  .lp-sticky .lp-btn{flex:1;min-height:46px;padding:12px}
  .lp-sticky-wa{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid #16a34a;color:#15803d;border-radius:12px;font-weight:800;text-decoration:none;font-size:15px}
}
`;
