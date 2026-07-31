'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import {
  FaWifi, FaBolt, FaServer, FaMobileAlt, FaFire, FaFileInvoiceDollar, FaSyncAlt,
  FaCheckCircle, FaArrowRight, FaCheck, FaChevronDown, FaCloud, FaDesktop, FaGlobe,
  FaShieldAlt, FaUtensils, FaPlug,
} from 'react-icons/fa';

const RED = '#ef4444';
const RED_DK = '#dc2626';
const SLATE = '#0f172a';
const GREEN = '#16a34a';

export default function OfflinePosLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: <FaWifi />, title: 'Bill with zero internet', desc: 'Full billing, GST/VAT, split bills, discounts, printed & digital receipts — all working on your local Wi-Fi with the internet completely down.' },
    { icon: <FaServer />, title: 'A real on-site server', desc: 'One machine runs the actual software and database on your premises — not a fragile browser cache. No time limit, no single point of failure.' },
    { icon: <FaSyncAlt />, title: 'Real-time LAN sync', desc: 'Every terminal — counter, waiter tablets, kitchen screen — stays in sync instantly over the local network. No internet in the loop.' },
    { icon: <FaMobileAlt />, title: 'Waiters order offline', desc: 'Servers take orders and fire them to the kitchen from phones and tablets on the same Wi-Fi — no signal needed anywhere on the floor.' },
    { icon: <FaFire />, title: 'KOT printing offline', desc: 'Kitchen tickets print over the LAN to one or many stations — tandoor, Chinese, bar, expo — exactly as they do online.' },
    { icon: <FaCloud />, title: 'Sync later, or stay offline', desc: 'When the internet returns, the day’s orders and sales mirror to the cloud automatically. Or run a fully offline island — your choice.' },
  ];

  const steps = [
    { n: '1', icon: <FaDesktop />, title: 'Install the server app', desc: 'One self-contained installer for Windows or Mac — it bundles the full backend and a local database. No separate DB, no developers.' },
    { n: '2', icon: <FaPlug />, title: 'Connect your terminals', desc: 'Point every billing PC, waiter tablet and kitchen screen at dineopen-server.local on your Wi-Fi. No IP addresses to configure.' },
    { n: '3', icon: <FaBolt />, title: 'Start billing offline', desc: 'Take orders, print KOTs and bill with zero internet. Turn on cloud sync to mirror data online, or stay fully offline.' },
  ];

  const regions = [
    { flag: '🇮🇳', title: 'India', desc: 'Power-cut & patchy-internet proof, GST + UPI offline.', href: '/blog/offline-pos-restaurants-india-2026.html' },
    { flag: '🇺🇸', title: 'USA', desc: 'ISP-outage reliability, sales tax + tips, multi-location.', href: '/blog/offline-pos-restaurants-usa-2026.html' },
    { flag: '🇬🇧 🇦🇪', title: 'UK & Dubai/UAE', desc: 'Offline EPOS, VAT + HMRC MTD / FTA / ZATCA e-invoicing.', href: '/blog/offline-pos-restaurants-uk-uae-2026.html' },
  ];

  const compare = [
    ['Bill during an internet outage', '❌ or short cache', '✅ Unlimited'],
    ['Waiter tablets work offline', '❌ Usually go dark', '✅ Full LAN ordering'],
    ['KOT printing offline', '❌ / partial', '✅ Single & multi-station'],
    ['Data safe without internet', 'Risky (cache)', '✅ Real local database'],
    ['Cloud reporting & back-up', '✅', '✅ Syncs when online'],
    ['Stay 100% offline if you want', '❌', '✅'],
  ];

  const faqs = [
    { q: 'Can a restaurant POS work without internet?', a: 'Yes. DineOpen is offline-first: one machine runs a local server (with its own database) on your Wi-Fi, so you can bill, print KOTs and take orders with zero internet. When the connection returns, data syncs to the cloud automatically — or you can stay fully offline.' },
    { q: 'What’s a true offline POS vs an offline "cache"?', a: 'A true offline POS runs the real software and database on-site, so every terminal keeps working over the local network with no time limit. An "offline cache" only lets one device bill briefly before it expires, while waiter tablets and the kitchen screen go dark.' },
    { q: 'Can waiters take orders offline?', a: 'Yes. Waiter phones and tablets connect to the same local Wi-Fi as the billing machine and fire orders to the kitchen instantly over the LAN — no internet required, and every terminal stays in sync in real time.' },
    { q: 'Does offline billing stay GST and VAT compliant?', a: 'Yes. DineOpen calculates GST (India) and VAT (UK, UAE and GCC), generates sequential compliant invoices and stores every bill locally, so records are complete and filing-ready even without internet.' },
    { q: 'Will I lose data if the internet goes down?', a: 'No. Orders and bills are written to a real local database on your server machine, not a temporary browser cache. The cloud is a mirror that updates when you are online.' },
    { q: 'How do I set it up?', a: 'Install one app on a single computer (Windows or Mac) — it bundles the full backend and local database. Every other terminal connects to it over your Wi-Fi at a fixed address (dineopen-server.local). No IP setup, no separate database, no developers.' },
  ];

  return (
    <>
      <CommonHeader />
      <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', overflowX: 'hidden' }}>

        {/* HERO */}
        <section style={{ padding: isMobile ? '40px 20px 56px' : '84px 40px 96px', background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 55%, #fef2f2 100%)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 40 : 56 }}>
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fee2e2', color: RED_DK, fontWeight: 800, fontSize: 13, padding: '6px 14px', borderRadius: 999, marginBottom: 20 }}>
                <FaWifi /> No internet? No problem.
              </span>
              <h1 style={{ fontSize: isMobile ? 34 : 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px', margin: '0 0 18px' }}>
                The offline POS that<br /><span style={{ color: RED_DK }}>never stops billing</span>
              </h1>
              <p style={{ fontSize: isMobile ? 16 : 19, color: '#4b5563', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 560, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
                DineOpen runs a real server <b>inside your restaurant</b>. Bill, print KOTs and take waiter orders on your local Wi-Fi with <b>zero internet</b> — then sync to the cloud when you’re back online, or stay fully offline. Outage-proof, power-cut proof, GST/VAT ready.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Link href="/register" style={btn(RED_DK, '#fff')}>Start free <FaArrowRight size={13} /></Link>
                <Link href="/contact" style={btn('#fff', SLATE, `2px solid #e5e7eb`)}>Book a demo</Link>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 26, justifyContent: isMobile ? 'center' : 'flex-start', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                <span style={pill()}><FaCheck color={GREEN} /> Bill offline forever</span>
                <span style={pill()}><FaCheck color={GREEN} />10–20 LAN terminals</span>
                <span style={pill()}><FaCheck color={GREEN} /> Windows & Mac</span>
              </div>
            </div>
            <div style={{ flex: isMobile ? 'unset' : '0 0 380px', display: 'flex', justifyContent: 'center' }}>
              <NetworkDiagram />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{ background: SLATE, padding: isMobile ? '36px 20px' : '44px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
            {[['0', 'internet needed to bill'], ['10–20', 'terminals on one LAN'], ['100%', 'orders saved locally'], ['1', 'app to install']].map(([a, b]) => (
              <div key={b}>
                <div style={{ fontSize: isMobile ? 30 : 40, fontWeight: 900, color: '#fca5a5' }}>{a}</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4, fontWeight: 600 }}>{b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <SectionHead eyebrow="Truly offline-first" title="Your whole floor, running without the cloud" sub="Not a cache with a countdown — a real server on your premises." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 44 }}>
              {features.map((f) => (
                <div key={f.title} style={{ background: '#f9fafb', border: '1px solid #eef2f7', borderRadius: 18, padding: 26 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#fee2e2,#fecaca)', color: RED_DK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ fontSize: 14.5, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <SectionHead eyebrow="Live in minutes" title="Three steps, one app" sub="No servers to configure, no database to install, no developers." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 44 }}>
              {steps.map((s) => (
                <div key={s.n} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 18, padding: 28, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -16, left: 24, width: 36, height: 36, borderRadius: 10, background: RED_DK, color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
                  <div style={{ fontSize: 26, color: RED_DK, margin: '14px 0 12px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14.5, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionHead eyebrow="The difference" title="Offline-first vs cloud-only POS" />
            <div style={{ marginTop: 36, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 520, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <thead><tr>
                  <th style={th()}>Capability</th><th style={th()}>Cloud-only POS</th><th style={{ ...th(), background: RED_DK }}>DineOpen (offline-first)</th>
                </tr></thead>
                <tbody>
                  {compare.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                      <td style={td(700)}>{r[0]}</td><td style={td()}>{r[1]}</td><td style={{ ...td(700), color: GREEN }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* REGIONS → blogs */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <SectionHead eyebrow="Built for every market" title="Offline POS, wherever you serve" sub="Read the in-depth guide for your region." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 44 }}>
              {regions.map((r) => (
                <Link key={r.title} href={r.href} style={{ textDecoration: 'none', background: '#fff', border: '1px solid #eef2f7', borderRadius: 18, padding: 26, display: 'block', color: 'inherit' }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{r.flag}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 6px' }}>{r.title}</h3>
                  <p style={{ fontSize: 14.5, color: '#5b6472', lineHeight: 1.6, margin: '0 0 12px' }}>{r.desc}</p>
                  <span style={{ color: RED_DK, fontWeight: 800, fontSize: 14 }}>Read the guide <FaArrowRight size={11} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST band */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', background: SLATE }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24 }}>
            {[[<FaFileInvoiceDollar key="f" />, 'GST & VAT compliant', 'Correct tax + sequential invoices, generated locally — even offline.'], [<FaShieldAlt key="s" />, 'Nothing gets lost', 'Every order & bill is written to a real on-site database.'], [<FaUtensils key="u" />, 'Whole floor in sync', 'Counter, waiter tablets & kitchen — one live source of truth on the LAN.']].map(([ic, t, d]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, color: '#fca5a5', marginBottom: 12 }}>{ic}</div>
                <h4 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>{t}</h4>
                <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <SectionHead eyebrow="Answers" title="Offline POS — FAQ" />
            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ border: '1px solid #eef2f7', borderRadius: 14, overflow: 'hidden', background: openFaq === i ? '#f9fafb' : '#fff' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {f.q}
                    <FaChevronDown style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: RED_DK, flexShrink: 0 }} />
                  </button>
                  {openFaq === i && <div style={{ padding: '0 20px 20px', fontSize: 15, color: '#4b5563', lineHeight: 1.7 }}>{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '90px 40px', background: `linear-gradient(135deg, ${RED_DK} 0%, ${SLATE} 100%)`, textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <FaWifi size={44} color="#fff" style={{ marginBottom: 18, opacity: 0.9 }} />
            <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.5px' }}>Bill through any outage</h2>
            <p style={{ fontSize: 17, color: '#fecaca', margin: '0 0 30px', lineHeight: 1.6 }}>Run your whole restaurant offline on the local network, and sync to the cloud the moment you’re back online.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={btn('#fff', RED_DK)}>Start free <FaArrowRight size={13} /></Link>
              <Link href="/contact" style={btn('transparent', '#fff', '2px solid rgba(255,255,255,0.6)')}>Talk to us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const btn = (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: bg, color, border: border || 'none', borderRadius: 12, fontSize: 15.5, fontWeight: 800, textDecoration: 'none', cursor: 'pointer' });
const pill = () => ({ display: 'inline-flex', alignItems: 'center', gap: 6 });
const th = () => ({ textAlign: 'left', padding: '12px 14px', background: SLATE, color: '#fff', fontWeight: 800, fontSize: 13.5 });
const td = (w) => ({ padding: '12px 14px', borderBottom: '1px solid #eef2f7', fontWeight: w || 400, color: '#28313f' });

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
      {eyebrow && <div style={{ color: RED_DK, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px', lineHeight: 1.15 }}>{title}</h2>
      {sub && <p style={{ fontSize: 17, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{sub}</p>}
    </div>
  );
}

/* LAN network diagram — pure CSS, no external images */
function NetworkDiagram() {
  const node = (icon, label, tint, color) => (
    <div style={{ background: '#fff', border: `1.5px solid ${tint}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center', minWidth: 92, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 20, color, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>{label}</div>
    </div>
  );
  return (
    <div style={{ width: 360, maxWidth: '100%', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 24, padding: 22, boxShadow: '0 30px 70px rgba(15,23,42,0.18)' }}>
      {/* cloud (dashed / optional) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eef2ff', border: '1.5px dashed #c7d2fe', borderRadius: 12, padding: '8px 14px', color: '#4f46e5', fontWeight: 700, fontSize: 12.5 }}>
          <FaCloud /> Cloud · syncs when online
        </div>
      </div>
      <div style={{ height: 18, borderLeft: '2px dashed #c7d2fe', width: 0, margin: '0 auto' }} />
      {/* local server */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 6px' }}>
        <div style={{ background: SLATE, color: '#fff', borderRadius: 16, padding: '16px 18px', textAlign: 'center', minWidth: 190, boxShadow: '0 10px 24px rgba(15,23,42,0.25)' }}>
          <FaServer size={22} />
          <div style={{ fontWeight: 800, fontSize: 14, marginTop: 6 }}>Local Server</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>dineopen-server.local</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, background: 'rgba(34,197,94,0.15)', color: '#86efac', fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 999 }}>
            <FaWifi size={9} /> LAN · no internet
          </div>
        </div>
      </div>
      <div style={{ height: 16, borderLeft: '2px solid #cbd5e1', width: 0, margin: '0 auto' }} />
      {/* terminals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        {node(<FaDesktop />, 'POS Counter', '#fecaca', RED_DK)}
        {node(<FaMobileAlt />, 'Waiter', '#bfdbfe', '#2563eb')}
        {node(<FaFire />, 'Kitchen', '#fde68a', '#b45309')}
      </div>
    </div>
  );
}
