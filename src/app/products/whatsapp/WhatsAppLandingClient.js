'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import {
  FaWhatsapp, FaShoppingBag, FaBell, FaBullhorn, FaRobot, FaStar, FaGift,
  FaCheckCircle, FaArrowRight, FaBolt, FaMobileAlt,
  FaChevronDown, FaGlobe, FaShieldAlt, FaCheck, FaClock,
} from 'react-icons/fa';

const GREEN = '#25D366';
const GREEN_DK = '#128C7E';
const RED = '#ef4444';
const RED_DK = '#dc2626';

export default function WhatsAppLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: <FaShoppingBag />, title: 'WhatsApp Ordering', desc: 'Customers browse your menu and order right inside WhatsApp — via catalog or AI chat. Orders drop straight into your POS and kitchen. No aggregator, no per-order commission.' },
    { icon: <FaBell />, title: 'Order Updates & Bills', desc: 'Automatic confirmations and status — preparing, ready, out for delivery, delivered — plus the digital bill and receipt, sent the moment it happens.' },
    { icon: <FaBullhorn />, title: 'Broadcast Marketing', desc: 'Send offers, new-menu launches and festival specials to segmented customer lists. 90%+ open rates — the single highest-ROI channel in your stack.' },
    { icon: <FaRobot />, title: 'AI Chatbot 24/7', desc: 'An AI assistant answers menu questions, order status, timings and bookings around the clock — powered by DineOpen’s AI, trained on your restaurant.' },
    { icon: <FaStar />, title: 'Reviews on Autopilot', desc: 'After every order, ask for feedback and route happy guests straight to your Google review page — grow your rating without lifting a finger.' },
    { icon: <FaGift />, title: 'Loyalty & Win-Back', desc: 'Points balance, cashback alerts, birthday treats and “we miss you” nudges that quietly pull customers back — all automated on WhatsApp.' },
  ];

  const steps = [
    { n: '1', icon: <FaMobileAlt />, title: 'Connect or rent a number', desc: 'Use your own WhatsApp Business number — or get a ready-to-use rented number from us, verified and live in minutes with zero setup.' },
    { n: '2', icon: <FaCheckCircle />, title: 'Approve your templates', desc: 'Pick from a library of pre-built, Meta-approved templates for orders, bills, reminders and offers. We handle the compliance.' },
    { n: '3', icon: <FaBolt />, title: 'Go live', desc: 'Take orders, send updates and digital bills, and run broadcast campaigns — all from your DineOpen dashboard.' },
  ];

  const faqs = [
    { q: 'Can restaurants take orders on WhatsApp with DineOpen?', a: 'Yes. Customers message your WhatsApp number, browse your menu via a catalog or an AI chatbot, and place an order that lands directly in your DineOpen POS and kitchen (KOT) — no third-party aggregator and no commission per order.' },
    { q: 'Do I need my own WhatsApp API number, or can I rent one?', a: 'Both work. Connect your own number on the official WhatsApp Business (Cloud) API, or use a ready-to-use rented number provisioned by DineOpen with pre-approved templates so you go live in minutes with zero setup.' },
    { q: 'What can I send customers on WhatsApp?', a: 'Order confirmations and status updates, digital bills and receipts, table-booking confirmations and reminders, marketing broadcasts (offers, new menu, festivals), loyalty and cashback alerts, birthday and win-back messages, and post-order feedback requests that route happy guests to your Google review page.' },
    { q: 'Why is WhatsApp better than SMS or email?', a: 'WhatsApp messages are typically opened by over 90% of recipients — far above the ~20% of email and SMS — and support rich menus, images, buttons and instant two-way replies. That’s why WhatsApp drives far more repeat orders for restaurants.' },
    { q: 'Is it compliant? Do customers have to opt in?', a: 'Yes. DineOpen manages opt-in consent and uses only Meta-approved templates, so your WhatsApp marketing stays compliant with WhatsApp Business policy while you reach opted-in customers.' },
    { q: 'How much does it cost?', a: 'Order-related utility messaging is included on paid DineOpen POS plans. Marketing broadcasts and the AI chatbot are an affordable add-on, plus a small rental if you use a managed number. You pay only WhatsApp’s per-conversation charges, transparently.' },
  ];

  return (
    <>
      <CommonHeader />
      <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', overflowX: 'hidden' }}>

        {/* ── HERO ── */}
        <section style={{ padding: isMobile ? '40px 20px 56px' : '84px 40px 96px', background: 'linear-gradient(160deg, #ecfdf5 0%, #ffffff 55%, #fef2f2 100%)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 40 : 56 }}>
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: GREEN_DK, fontWeight: 800, fontSize: 13, padding: '6px 14px', borderRadius: 999, marginBottom: 20 }}>
                <FaWhatsapp /> Official WhatsApp Business API
              </span>
              <h1 style={{ fontSize: isMobile ? 34 : 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px', margin: '0 0 18px' }}>
                Turn <span style={{ color: GREEN_DK }}>WhatsApp</span> into your #1<br />ordering &amp; marketing channel
              </h1>
              <p style={{ fontSize: isMobile ? 16 : 19, color: '#4b5563', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 560, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
                Take orders, send order updates and digital bills, run broadcast campaigns with <b>90%+ open rates</b>, collect reviews, and run an AI chatbot — all on WhatsApp, built right into your DineOpen POS. Use your own number or a ready-to-use rented one.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Link href="/register" style={btn(RED_DK, '#fff')}>Start free <FaArrowRight size={13} /></Link>
                <Link href="/contact" style={btn('#fff', GREEN_DK, `2px solid ${GREEN}`)}>Book a demo</Link>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 26, justifyContent: isMobile ? 'center' : 'flex-start', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                <span style={pill()}><FaCheck color={GREEN} /> No per-order commission</span>
                <span style={pill()}><FaCheck color={GREEN} /> Live in minutes</span>
                <span style={pill()}><FaCheck color={GREEN} /> Works with your POS</span>
              </div>
            </div>
            <div style={{ flex: isMobile ? 'unset' : '0 0 320px', display: 'flex', justifyContent: 'center' }}>
              <PhoneMockup />
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ background: '#0b3d2e', padding: isMobile ? '36px 20px' : '44px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
            {[['90%+', 'messages opened'], ['5×', 'more repeat orders'], ['0%', 'aggregator commission'], ['24/7', 'AI chatbot']].map(([a, b]) => (
              <div key={b}>
                <div style={{ fontSize: isMobile ? 30 : 40, fontWeight: 900, color: GREEN }}>{a}</div>
                <div style={{ fontSize: 13, color: '#a7f3d0', marginTop: 4, fontWeight: 600 }}>{b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <SectionHead eyebrow="Everything on one number" title="One WhatsApp number. Your whole restaurant." sub="From the first order to the fifth visit — every touchpoint your guests love, automated." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 44 }}>
              {features.map((f) => (
                <div key={f.title} style={{ background: '#f9fafb', border: '1px solid #eef2f7', borderRadius: 18, padding: 26, transition: 'transform .15s' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', color: GREEN_DK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ fontSize: 14.5, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <SectionHead eyebrow="Live in minutes" title="Three steps to go live" sub="No developers, no Meta paperwork headaches — we handle the hard parts." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 44 }}>
              {steps.map((s) => (
                <div key={s.n} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 18, padding: 28, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -16, left: 24, width: 36, height: 36, borderRadius: 10, background: GREEN_DK, color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
                  <div style={{ fontSize: 26, color: GREEN_DK, margin: '14px 0 12px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14.5, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OWN vs RENTED NUMBER ── */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <SectionHead eyebrow="Your number, your way" title="Bring your own — or rent one instantly" sub="Whatever fits your restaurant." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 22, marginTop: 44 }}>
              <PlanCard icon={<FaMobileAlt />} title="Your own number" points={['Use your existing business WhatsApp number', 'Official WhatsApp Business (Cloud) API', 'Keep your brand identity & chat history', 'We handle verification & templates']} tint="#f0fdf4" border="#bbf7d0" />
              <PlanCard icon={<FaGlobe />} title="Rented number (managed)" points={['Ready-to-use number, live in minutes', 'Pre-approved templates included', 'Zero Meta setup — we run it for you', 'Perfect for new outlets & quick launches']} tint="#fef2f2" border="#fecaca" badge="Most popular" />
            </div>
          </div>
        </section>

        {/* ── COMPLIANCE / TRUST ── */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', background: '#0b3d2e' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24 }}>
            {[[<FaShieldAlt key="s" />, 'Compliant by design', 'Managed opt-in consent + only Meta-approved templates.'], [<FaClock key="c" />, 'Automated, not manual', 'Triggers fire from real POS events — orders, bills, bookings.'], [<FaCheckCircle key="v" />, 'Built into your POS', 'No new tool to learn — it’s already inside DineOpen.']].map(([ic, t, d]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, color: GREEN, marginBottom: 12 }}>{ic}</div>
                <h4 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>{t}</h4>
                <p style={{ color: '#a7f3d0', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <SectionHead eyebrow="Simple pricing" title="Start free, scale when it pays for itself" sub="Order messaging is included. Marketing & AI are an affordable add-on. You only pay WhatsApp’s per-conversation charge on top." />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 44 }}>
              <PriceCard name="Order Messaging" price="Included" note="on paid POS plans" points={['Order confirmations & status', 'Digital bills & receipts', 'Booking confirmations']} />
              <PriceCard name="Marketing + AI" price="₹499" note="/mo add-on" highlight points={['Broadcast campaigns & segments', 'AI chatbot 24/7', 'Reviews & win-back automations']} />
              <PriceCard name="Managed Number" price="Rental" note="from ₹/mo" points={['Ready-to-use rented number', 'Pre-approved templates', 'We run compliance for you']} />
            </div>
          </div>
        </section>

        {/* ── FAQ (AEO) ── */}
        <section style={{ padding: isMobile ? '56px 20px' : '84px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <SectionHead eyebrow="Answers" title="WhatsApp for restaurants — FAQ" />
            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ border: '1px solid #eef2f7', borderRadius: 14, overflow: 'hidden', background: openFaq === i ? '#f9fafb' : '#fff' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {f.q}
                    <FaChevronDown style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: GREEN_DK, flexShrink: 0 }} />
                  </button>
                  {openFaq === i && <div style={{ padding: '0 20px 20px', fontSize: 15, color: '#4b5563', lineHeight: 1.7 }}>{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: isMobile ? '60px 20px' : '90px 40px', background: `linear-gradient(135deg, ${GREEN_DK} 0%, #0b3d2e 100%)`, textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <FaWhatsapp size={44} color={GREEN} style={{ marginBottom: 18 }} />
            <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.5px' }}>Get your restaurant on WhatsApp today</h2>
            <p style={{ fontSize: 17, color: '#d1fae5', margin: '0 0 30px', lineHeight: 1.6 }}>Orders, updates, bills, campaigns and an AI assistant — on the app your customers already use every day.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={btn('#fff', GREEN_DK)}>Start free <FaArrowRight size={13} /></Link>
              <Link href="/contact" style={btn('transparent', '#fff', '2px solid rgba(255,255,255,0.6)')}>Talk to us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ── helpers ── */
const btn = (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: bg, color, border: border || 'none', borderRadius: 12, fontSize: 15.5, fontWeight: 800, textDecoration: 'none', cursor: 'pointer' });
const pill = () => ({ display: 'inline-flex', alignItems: 'center', gap: 6 });

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
      {eyebrow && <div style={{ color: GREEN_DK, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px', lineHeight: 1.15 }}>{title}</h2>
      {sub && <p style={{ fontSize: 17, color: '#5b6472', lineHeight: 1.6, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function PlanCard({ icon, title, points, tint, border, badge }) {
  return (
    <div style={{ background: tint, border: `1.5px solid ${border}`, borderRadius: 20, padding: 28, position: 'relative' }}>
      {badge && <span style={{ position: 'absolute', top: 18, right: 18, background: RED_DK, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999 }}>{badge}</span>}
      <div style={{ fontSize: 28, color: GREEN_DK, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 14px' }}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {points.map((p) => (
          <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: '#374151' }}>
            <FaCheckCircle color={GREEN} style={{ flexShrink: 0, marginTop: 3 }} /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceCard({ name, price, note, points, highlight }) {
  return (
    <div style={{ background: '#fff', border: highlight ? `2px solid ${GREEN}` : '1px solid #eef2f7', borderRadius: 20, padding: 28, boxShadow: highlight ? '0 20px 50px rgba(18,140,126,0.15)' : '0 1px 3px rgba(0,0,0,0.04)', position: 'relative' }}>
      {highlight && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: GREEN_DK, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 999 }}>MOST POPULAR</span>}
      <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 10px' }}>{name}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: '#111827' }}>{price}</span>
        <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>{note}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {points.map((p) => (
          <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: '#374151' }}>
            <FaCheck color={GREEN} style={{ flexShrink: 0, marginTop: 3 }} /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* WhatsApp chat phone mockup — pure CSS, no external images */
function PhoneMockup() {
  const bubbleIn = { alignSelf: 'flex-start', background: '#fff', color: '#111827', borderRadius: '12px 12px 12px 2px' };
  const bubbleOut = { alignSelf: 'flex-end', background: '#d9fdd3', color: '#111827', borderRadius: '12px 12px 2px 12px' };
  const base = { maxWidth: '82%', padding: '9px 12px', fontSize: 13, lineHeight: 1.45, boxShadow: '0 1px 1px rgba(0,0,0,0.08)' };
  return (
    <div style={{ width: 300, background: '#111', borderRadius: 40, padding: 12, boxShadow: '0 30px 70px rgba(11,61,46,0.35)' }}>
      <div style={{ borderRadius: 30, overflow: 'hidden', background: '#e5ddd5', height: 560, display: 'flex', flexDirection: 'column' }}>
        {/* chat header */}
        <div style={{ background: GREEN_DK, color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', color: GREEN_DK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>🍽️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Spice Garden</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>online</div>
          </div>
        </div>
        {/* chat body */}
        <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          <div style={{ ...base, ...bubbleIn }}>Hi! 1 Margherita Pizza 🍕 &amp; a Coke please</div>
          <div style={{ ...base, ...bubbleOut }}>✅ <b>Order #42 confirmed!</b><br />Total ₹499 · Preparing now 👨‍🍳</div>
          <div style={{ ...base, ...bubbleOut }}>🔔 Your order is <b>READY</b>! See you soon 😊</div>
          <div style={{ ...base, ...bubbleOut, background: '#fff', border: `1px dashed ${RED}`, borderRadius: 12, maxWidth: '92%' }}>
            <div style={{ fontWeight: 800, color: RED_DK }}>🎉 Weekend Offer</div>
            <div style={{ fontSize: 12.5, marginTop: 2 }}>20% off all pizzas this Sat &amp; Sun. Reply <b>PIZZA</b> to order!</div>
          </div>
          <div style={{ ...base, ...bubbleIn }}>⭐ Loved it! How do I leave a review?</div>
          <div style={{ ...base, ...bubbleOut }}>Thank you! 🙏 Tap here to rate us on Google ➜</div>
        </div>
        {/* input */}
        <div style={{ background: '#f0f0f0', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 999, padding: '8px 14px', fontSize: 12.5, color: '#9ca3af' }}>Type a message</div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaWhatsapp /></div>
        </div>
      </div>
    </div>
  );
}
