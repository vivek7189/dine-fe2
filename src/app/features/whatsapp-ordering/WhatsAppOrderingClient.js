'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import {
  FaWhatsapp, FaStore, FaQrcode, FaListUl, FaMotorcycle, FaCreditCard,
  FaFire, FaCheckCircle, FaBolt, FaGlobe, FaMobileAlt, FaArrowRight,
} from 'react-icons/fa';

const WA_GREEN = '#25D366';
const WA_DARK = '#075E54';
const WA_TEAL = '#128C7E';
const CHAT_BG = '#E5DDD5';

const FAQS = [
  {
    q: 'How do customers order on WhatsApp?',
    a: 'They message your restaurant\'s WhatsApp number (or scan your QR code / tap your link). A guided chat walks them through your menu — pick a category, choose an item, set size and toppings, add a delivery address, and confirm. No app to download.',
  },
  {
    q: 'Do I need a separate app or device?',
    a: 'No. Customers use the WhatsApp they already have, and every order drops straight into your existing DineOpen POS and kitchen screen — the same place your dine-in and QR orders appear. Your staff don\'t learn anything new.',
  },
  {
    q: 'Can customers pay through WhatsApp?',
    a: 'Yes. You can collect payment with a secure online payment link, or let customers pay at the counter / on delivery — you choose per restaurant.',
  },
  {
    q: 'Does it handle sizes, toppings and delivery addresses?',
    a: 'Yes. The chat supports item variants (e.g. Small / Medium / Large), add-ons and modifiers (extra cheese, toppings), special instructions, quantities, and a full delivery address — all captured in the conversation.',
  },
  {
    q: 'Which countries and languages does it work in?',
    a: 'WhatsApp ordering works anywhere WhatsApp does — the US, UK, Europe, the Middle East, India, Africa and beyond — with your own currency and menu. It uses each restaurant\'s own connected WhatsApp Business number.',
  },
  {
    q: 'How long does setup take?',
    a: 'A few minutes. Connect your WhatsApp Business number once, flip the "Enable Ordering" toggle in your dashboard, set a welcome message and payment option — done. Customers can order the same day.',
  },
];

export default function WhatsAppOrderingClient() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const sec = { maxWidth: 1160, margin: '0 auto', padding: '0 20px' };
  const h2 = { fontSize: 34, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 14px' };
  const sub = { fontSize: 17, color: '#64748b', textAlign: 'center', maxWidth: 640, margin: '0 auto 46px', lineHeight: 1.6 };

  return (
    <>
      <CommonHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg,#f0fdf4 0%,#ffffff 100%)', padding: '64px 0 40px' }}>
        <div style={{ ...sec, display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
              <FaWhatsapp /> WhatsApp Ordering
            </div>
            <h1 style={{ fontSize: 46, lineHeight: 1.1, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>
              Let customers order from your restaurant <span style={{ color: WA_GREEN }}>on WhatsApp</span>
            </h1>
            <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6, margin: '0 0 26px' }}>
              Turn the world&apos;s most-used chat app into an ordering channel. Customers tap through your menu in a familiar conversation — pizzas, sides, drinks — and every order lands straight in your POS and kitchen. No app to download, no commissions.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" style={{ background: WA_GREEN, color: '#fff', padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Start free <FaArrowRight size={13} />
              </Link>
              <a href="#how" style={{ background: '#fff', color: '#0f172a', padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                See how it works
              </a>
            </div>
            <div style={{ display: 'flex', gap: 22, marginTop: 30, flexWrap: 'wrap' }}>
              {[['2B+', 'people on WhatsApp'], ['0', 'apps to download'], ['~60s', 'to place an order']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: WA_TEAL }}>{n}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '0 0 340px', margin: '0 auto' }}>
            <DemoPhone />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '64px 0' }}>
        <div style={sec}>
          <h2 style={h2}>How WhatsApp ordering works</h2>
          <p style={sub}>Set it up once. Customers order the same day — from the chat app already on their phone.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 22 }}>
            {[
              { icon: FaWhatsapp, t: '1. Connect your number', d: 'Link your WhatsApp Business number to DineOpen in a few clicks — no coding.' },
              { icon: FaQrcode, t: '2. Share your QR or link', d: 'Put your WhatsApp QR on tables, flyers and social — or share a click-to-chat link.' },
              { icon: FaListUl, t: '3. Customers order in chat', d: 'A guided menu handles items, sizes, toppings, quantity, address and payment.' },
              { icon: FaFire, t: '4. Orders hit your kitchen', d: 'Each order drops into your POS and prints to the kitchen automatically — like any order.' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <s.icon size={20} color={WA_TEAL} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{s.t}</div>
                <div style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.55 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '20px 0 64px', background: '#f8fafc' }}>
        <div style={{ ...sec, paddingTop: 54 }}>
          <h2 style={h2}>Everything a real order needs</h2>
          <p style={sub}>Not just a chat — a full ordering engine that behaves exactly like your dine-in and QR orders.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { icon: FaListUl, t: 'Guided menu', d: 'Categories, items, photos and prices — customers browse and add to cart inside the chat.' },
              { icon: FaBolt, t: 'Sizes & toppings', d: 'Variants (Small/Medium/Large), add-ons and special instructions, all priced correctly.' },
              { icon: FaMotorcycle, t: 'Delivery or pickup', d: 'Collect a delivery address for delivery orders, or keep it simple for takeaway.' },
              { icon: FaCreditCard, t: 'Payments your way', d: 'Send a secure payment link, or take payment at the counter / on delivery.' },
              { icon: FaFire, t: 'Auto to the kitchen', d: 'Orders print a KOT and appear on your kitchen screen the instant they\'re confirmed.' },
              { icon: FaStore, t: 'One place for all orders', d: 'WhatsApp, QR and dine-in orders all flow into the same POS, reports and inventory.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 16, padding: 24 }}>
                <f.icon size={22} color={WA_GREEN} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{f.t}</div>
                <div style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.55 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ padding: '64px 0' }}>
        <div style={sec}>
          <h2 style={h2}>Why restaurants love ordering on WhatsApp</h2>
          <p style={sub}>Meet customers where they already are — and keep 100% of the order.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20 }}>
            {[
              { icon: FaMobileAlt, t: 'No app friction', d: 'Nothing to install or sign up for. If they have WhatsApp, they can order — that\'s billions of people.' },
              { icon: FaGlobe, t: 'Works worldwide', d: 'Your own number, your currency, your menu — the US, UK, Europe, Middle East, India and beyond.' },
              { icon: FaCheckCircle, t: 'Commission-free', d: 'No aggregator cut on every order. Customers stay yours, and so do their phone numbers for re-marketing.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(180deg,#f0fdf4,#fff)', border: '1px solid #dcfce7' }}>
                <f.icon size={24} color={WA_TEAL} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{f.t}</div>
                <div style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '20px 0 64px', background: '#f8fafc' }}>
        <div style={{ ...sec, maxWidth: 820, paddingTop: 54 }}>
          <h2 style={h2}>WhatsApp ordering FAQ</h2>
          <p style={sub}>The quick answers restaurant owners ask most.</p>
          <div>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 14, padding: '20px 22px', marginBottom: 12 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{f.q}</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 0', background: WA_DARK }}>
        <div style={{ ...sec, textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>Start taking orders on WhatsApp today</h2>
          <p style={{ fontSize: 17, color: '#d1fae5', maxWidth: 560, margin: '0 auto 26px', lineHeight: 1.6 }}>
            Connect your number, flip a toggle, and let customers order in the app they already love — commission-free.
          </p>
          <Link href="/register" style={{ background: WA_GREEN, color: '#fff', padding: '15px 34px', borderRadius: 12, fontWeight: 800, fontSize: 17, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get started free <FaArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ---------- Animated WhatsApp phone demo (international: pizza, US/UK) ---------- */
function DemoPhone() {
  const script = [
    { from: 'bot', text: 'Welcome to Tony\'s Pizzeria! 🍕\nType *menu* to see our menu.' },
    { from: 'user', text: 'menu' },
    { from: 'bot', text: '📋 *Our Menu* — pick a category:', chips: ['Pizzas', 'Sides', 'Drinks'] },
    { from: 'user', text: 'Pizzas' },
    { from: 'bot', text: 'Choose a pizza:', chips: ['Margherita · $12', 'Pepperoni · $14', 'BBQ Chicken · $15'] },
    { from: 'user', text: 'Pepperoni' },
    { from: 'bot', text: '*Pepperoni* — pick a size:', chips: ['Small · $12', 'Medium · $14', 'Large · $17'] },
    { from: 'user', text: 'Large' },
    { from: 'bot', text: 'How many? (1–20)' },
    { from: 'user', text: '2' },
    { from: 'bot', text: '✅ Added *2× Pepperoni (Large)*\n🛒 Total: $34', chips: ['Checkout', 'Add More'] },
    { from: 'user', text: 'Checkout' },
    { from: 'bot', text: 'Please enter your *name*:' },
    { from: 'user', text: 'Emma' },
    { from: 'bot', text: 'Share your *delivery address* 📍' },
    { from: 'user', text: '221B Baker Street, London' },
    { from: 'bot', text: '📋 *Order Summary*\n👤 Emma\n2× Pepperoni (Large) — $34\n📍 221B Baker Street\n\nConfirm your order?', chips: ['Confirm Order', 'Edit'] },
    { from: 'user', text: 'Confirm Order' },
    { from: 'bot', text: '✅ *Order Placed!*\n🔢 Order #TP1043\n💳 Pay on delivery\nWe\'ll start baking 🍕 Thank you, Emma!' },
  ];
  const [n, setN] = useState(1);
  const len = script.length;
  const scrollRef = useRef(null);

  useEffect(() => {
    const atEnd = n >= len;
    const t = setTimeout(() => setN(atEnd ? 1 : n + 1), atEnd ? 2600 : 1000);
    return () => clearTimeout(t);
  }, [n, len]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [n]);

  const fmt = (t) => t.split('*').map((seg, i) => (i % 2 ? <b key={i}>{seg}</b> : <span key={i}>{seg}</span>));

  return (
    <div style={{ width: 320, margin: '0 auto', border: '10px solid #111827', borderRadius: 36, overflow: 'hidden', boxShadow: '0 20px 44px rgba(0,0,0,.22)', background: '#000' }}>
      <div style={{ background: WA_DARK, color: '#fff', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 17 }}>🍕</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>Tony&apos;s Pizzeria</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>online</div>
        </div>
        <FaWhatsapp size={18} />
      </div>
      <div ref={scrollRef} style={{ background: CHAT_BG, height: 440, overflowY: 'auto', padding: '12px 10px', backgroundImage: 'radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
        {script.slice(0, n).map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 7 }}>
            <div style={{ maxWidth: '82%', background: m.from === 'user' ? '#DCF8C6' : '#fff', color: '#111827', padding: '8px 11px', borderRadius: 10, fontSize: 13, lineHeight: 1.4, whiteSpace: 'pre-wrap', boxShadow: '0 1px 1px rgba(0,0,0,.08)' }}>
              {fmt(m.text)}
              {m.chips && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                  {m.chips.map((c, j) => (
                    <div key={j} style={{ border: `1px solid ${WA_TEAL}`, color: WA_TEAL, borderRadius: 7, padding: '6px 8px', fontSize: 12.5, fontWeight: 600, textAlign: 'center', background: '#fff' }}>{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#F0F0F0', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: '8px 12px', fontSize: 12.5, color: '#9ca3af' }}>Type a message…</div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: WA_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaWhatsapp color="#fff" size={16} />
        </div>
      </div>
    </div>
  );
}
