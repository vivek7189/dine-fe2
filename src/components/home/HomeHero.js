'use client';

// Homepage hero: the original centred layout (global badge, rotating business type, six product
// cards) with phone signup in place of the old "Start Free Trial" button.
// "Start free" keeps the typed number in sessionStorage (never in the URL) for /login to pre-fill.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaReceipt, FaQrcode, FaWhatsapp, FaUtensils, FaMobileAlt, FaBoxes, FaChartBar, FaStar, FaCheck } from 'react-icons/fa';
import { track } from '../../lib/analytics';
import { detectCountry } from '../../lib/detectCountry';

export const PREFILL_PHONE_KEY = 'dineopen_prefill_phone';
const WHATSAPP_DEMO_URL = 'https://wa.me/919528632779?text=' + encodeURIComponent("Hi DineOpen, I'd like a demo for my restaurant.");

const DIAL = [
  ['IN', '+91'], ['AE', '+971'], ['SA', '+966'], ['QA', '+974'], ['OM', '+968'], ['KW', '+965'], ['BH', '+973'],
  ['GB', '+44'], ['US', '+1'], ['CA', '+1'], ['AU', '+61'], ['SG', '+65'], ['KE', '+254'], ['NG', '+234'], ['PK', '+92'],
];

const WORDS = ['Restaurants', 'Cafes', 'Bars', 'Cloud Kitchens', 'Food Trucks', 'Bakeries'];

const CARDS = [
  { href: '/products/pos', Icon: FaReceipt, color: '#ef4444', title: 'POS & Billing', sub: 'Bill in seconds' },
  { href: '/features/online-ordering', Icon: FaQrcode, color: '#2563eb', title: 'QR & Online Orders', sub: 'Order from the table' },
  { href: '/features/whatsapp-ordering', Icon: FaWhatsapp, color: '#16a34a', title: 'WhatsApp Orders', sub: '0% commission' },
  { href: '/products/kitchen', Icon: FaUtensils, color: '#f97316', title: 'Kitchen Display', sub: 'KOTs to every station' },
  { href: '/products/waiter-app', Icon: FaMobileAlt, color: '#0d9488', title: 'Waiter App', sub: 'Tableside ordering' },
  { href: '/products/inventory', Icon: FaBoxes, color: '#ca8a04', title: 'Inventory', sub: 'Low-stock alerts' },
  { href: '/products/ai', Icon: FaChartBar, color: '#7c3aed', title: 'Reports & AI', sub: 'Know what sells' },
  { href: '/products/loyalty', Icon: FaStar, color: '#db2777', title: 'Loyalty & CRM', sub: 'Bring guests back' },
];

export default function HomeHero({ onDemo }) {
  const router = useRouter();
  const [country, setCountry] = useState('IN');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [word, setWord] = useState(0);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const { countryCode } = detectCountry();
    if (countryCode && DIAL.some(([c]) => c === countryCode)) setCountry(countryCode);
  }, []);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => {
      setWord((w) => (w + 1) % WORDS.length);
      setLit((i) => (i + 1) % CARDS.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const start = (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits && (digits.length < 6 || digits.length > 15)) { setError('Please check the phone number'); return; }
    if (digits) {
      try { sessionStorage.setItem(PREFILL_PHONE_KEY, JSON.stringify({ country, number: digits })); } catch { /* private mode */ }
    }
    track('home_hero_click', { choice: 'start', withPhone: Boolean(digits) });
    router.push('/login');
  };

  return (
    <section className="hh">
      <div className="hh-in">
        <span className="hh-badge">🚀 The Global Restaurant Operating System</span>
        <h1>Next-Gen AI Platform built for modern <span key={word} className="hh-word">{WORDS[word]}</span></h1>
        <p className="hh-sub">One system for billing, orders, kitchen, stock and customers. Runs on the phone, tablet or laptop you already have, in any country.</p>

        <div className="hh-cards">
          {CARDS.map(({ href, Icon, color, title, sub }, i) => (
            <Link key={href} href={href} className={'hh-card' + (i === lit ? ' lit' : '')} style={{ '--c': color }}
              onClick={() => track('home_feature_link', { feature: href, from: 'hero' })}>
              <i><Icon size={20} color="#fff" /></i>
              <span><b>{title}</b><small>{sub}</small></span>
            </Link>
          ))}
        </div>

        <div className="hh-start">
          <p className="hh-lead">Start free. Your POS is ready in minutes.</p>
          <form className="hh-form" onSubmit={start}>
            <label htmlFor="hero-dial" className="sr">Country code</label>
            <select id="hero-dial" value={country} onChange={(e) => setCountry(e.target.value)}>
              {DIAL.map(([c, d]) => <option key={c} value={c}>{c} {d}</option>)}
            </select>
            <label htmlFor="hero-phone" className="sr">Mobile number</label>
            <input id="hero-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Your mobile number"
              value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} />
            <button type="submit">Start free →</button>
          </form>
          {error && <p className="hh-err" role="alert">{error}</p>}
          <ul className="hh-trust">
            {['7-day free trial', 'No card needed', 'Free menu setup', '9 languages'].map((t) => <li key={t}><FaCheck size={11} />{t}</li>)}
          </ul>
          <p className="hh-alt">Prefer email or Google? <a href="/login" onClick={() => track('home_hero_click', { choice: 'other_signup' })}>Sign up here</a></p>
        </div>

        <div className="hh-demo">
          <span>Want a walkthrough first?</span>
          <button type="button" onClick={() => { track('home_hero_click', { choice: 'demo' }); onDemo(); }}>▶ Book a free demo</button>
          <a href={WHATSAPP_DEMO_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('home_hero_click', { choice: 'whatsapp' })}><FaWhatsapp size={15} /> Chat with us</a>
        </div>
      </div>

      <style jsx global>{`
        .hh{position:relative;overflow:hidden;text-align:center;padding:56px 20px 88px;background:radial-gradient(circle at 50% 0%,rgba(254,226,226,.45) 0%,rgba(255,255,255,0) 55%),#fff}
        .hh-in{max-width:1000px;margin:0 auto}
        .hh-badge{display:inline-block;padding:8px 20px;border-radius:30px;font-size:13px;font-weight:700;color:#111827;background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:1px solid #ddd6fe;box-shadow:0 2px 8px rgba(124,58,237,.15)}
        .hh h1{font-size:clamp(36px,6vw,68px);font-weight:900;line-height:1.1;letter-spacing:-2px;color:#111827;margin:28px auto 22px;max-width:15em}
        .hh-word{display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:hh-in .5s ease-out}
        @keyframes hh-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .hh-sub{font-size:clamp(17px,2vw,20px);color:#4b5563;line-height:1.65;margin:0 auto 34px;max-width:34em}
        .hh-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:980px;margin:0 auto 40px;text-align:left}
        .hh-card{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;background:#fff;border:1.5px solid #eef0f3;text-decoration:none;box-shadow:0 1px 2px rgba(15,23,42,.04);transition:transform .35s,box-shadow .35s,border-color .35s}
        .hh-card:hover,.hh-card.lit{transform:translateY(-3px);border-color:var(--c);box-shadow:0 14px 26px -16px var(--c)}
        .hh-card i{width:40px;height:40px;flex-shrink:0;border-radius:11px;display:grid;place-items:center;background:var(--c);transition:transform .35s}
        .hh-card.lit i{transform:scale(1.08)}
        .hh-card b{display:block;font-size:14px;color:#111827}
        .hh-card small{display:block;font-size:12px;color:#6b7280;margin-top:2px;line-height:1.35}
        .hh-start{max-width:600px;margin:0 auto;padding:22px 24px 18px;border-radius:22px;background:linear-gradient(180deg,#fff,#fff7f7);border:1px solid #fde2e2;box-shadow:0 24px 50px -30px rgba(239,68,68,.45)}
        .hh-lead{font-weight:800;font-size:17px;color:#111827;margin:0 0 12px}
        .hh-form{display:flex;border:2px solid #e5e7eb;border-radius:14px;background:#fff;padding:5px;transition:border-color .2s,box-shadow .2s}
        .hh-form:focus-within{border-color:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.1)}
        .hh-form select{border:0;background:#f8fafc;border-radius:10px;padding:0 10px;font:inherit;font-weight:700;font-size:14px;color:#111827;cursor:pointer}
        .hh-form input{flex:1;min-width:0;border:0;outline:0;padding:13px 14px;font:inherit;font-size:16px;color:#111827;background:transparent}
        .hh-form button{border:0;border-radius:10px;padding:0 24px;font:inherit;font-weight:800;font-size:16px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#ef4444,#dc2626);white-space:nowrap;box-shadow:0 8px 20px -8px rgba(239,68,68,.6)}
        .hh-form button:hover{background:#dc2626}
        .hh .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
        .hh-err{color:#dc2626;font-weight:600;font-size:14px;margin-top:10px}
        .hh-trust{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px}
        .hh-trust li{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:#374151}
        .hh-trust svg{color:#16a34a}
        .hh-alt{font-size:13.5px;color:#6b7280;margin:10px 0 0}
        .hh-alt a{color:#111827;font-weight:700;text-decoration:underline;text-underline-offset:3px;text-decoration-color:#d1d5db}
        .hh-demo{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;margin-top:22px}
        .hh-demo span{font-size:14px;font-weight:600;color:#6b7280;margin-right:2px}
        .hh-demo button,.hh-demo a{display:inline-flex;align-items:center;gap:7px;border:1.5px solid #e5e7eb;background:#fff;border-radius:11px;padding:9px 16px;font:inherit;font-weight:700;font-size:14px;color:#111827;cursor:pointer;text-decoration:none;transition:border-color .2s,color .2s}
        .hh-demo button:hover{border-color:#ef4444;color:#ef4444}
        .hh-demo a{color:#15803d}
        .hh-demo a:hover{border-color:#16a34a}
        @media (max-width:860px){.hh-cards{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:520px){
          .hh{padding:36px 16px 60px}
          .hh-form select{font-size:16px}
          .hh-in{display:flex;flex-direction:column;align-items:stretch}
          .hh-badge{align-self:center}
          .hh-cards{order:9;margin:32px 0 0}
          .hh h1{letter-spacing:-1px}
          .hh-cards{gap:8px}
          .hh-card{padding:11px;gap:10px}
          .hh-card i{width:34px;height:34px}
          .hh-card small{display:none}
          .hh-start{padding:18px 14px 14px}
          .hh-form{flex-wrap:wrap;gap:6px}
          .hh-form select{padding:12px 8px}
          .hh-form input{flex:1 1 160px}
          .hh-form button{flex:1 1 100%;padding:14px}
        }
        @media (prefers-reduced-motion:reduce){.hh-word{animation:none}.hh-card{transition:none}}
      `}</style>
    </section>
  );
}
