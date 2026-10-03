'use client';

import { useState, useRef } from 'react';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaHandshake, FaTools, FaWallet, FaCalendarCheck, FaWhatsapp, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { PARTNER_FAQS } from './faqs';

const RED = '#ef4444';
const INK = '#111827';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';

const section = { maxWidth: '1100px', margin: '0 auto', padding: '64px 20px' };
const h2 = { fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, color: INK, marginBottom: '12px', textAlign: 'center', lineHeight: 1.2 };
const lede = { fontSize: '17px', color: MUTED, maxWidth: '640px', margin: '0 auto 40px', textAlign: 'center', lineHeight: 1.6 };
const card = { backgroundColor: 'white', border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '24px' };
const input = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${BORDER}`, fontSize: '15px', color: INK, backgroundColor: 'white', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };

// Plans per market — same monthly prices as /pricing. US is the default; India uses the
// typical billing plan restaurants take (₹2,500/month).
const MARKETS = {
  US: { label: 'USA & others ($)', sym: '$', loc: 'en-US', plans: [['Starter', 20], ['Growth', 50], ['Pro', 99]] },
  IN: { label: 'India (₹)', sym: '₹', loc: 'en-IN', plans: [['Standard', 2500]] },
  GB: { label: 'UK (£)', sym: '£', loc: 'en-GB', plans: [['Starter', 16], ['Growth', 40], ['Pro', 79]] },
  AE: { label: 'UAE (AED)', sym: 'AED ', loc: 'en-US', plans: [['Starter', 75], ['Growth', 185], ['Pro', 365]] },
  SA: { label: 'Saudi Arabia (SAR)', sym: 'SAR ', loc: 'en-US', plans: [['Starter', 75], ['Growth', 190], ['Pro', 370]] },
  KW: { label: 'Kuwait (KWD)', sym: 'KWD ', loc: 'en-US', dec: 1, plans: [['Starter', 6], ['Growth', 15], ['Pro', 30]] },
  BH: { label: 'Bahrain (BHD)', sym: 'BHD ', loc: 'en-US', dec: 1, plans: [['Starter', 8], ['Growth', 19], ['Pro', 37]] },
  OM: { label: 'Oman (OMR)', sym: 'OMR ', loc: 'en-US', dec: 1, plans: [['Starter', 8], ['Growth', 19], ['Pro', 38]] },
};
const COMMISSION = 0.2;
const MAX_MESSAGE = 2000;

const audiences = [
  'POS, printer and hardware dealers',
  'Accountants and CAs who serve restaurants',
  'Restaurant consultants and trainers',
  'Food, packaging and equipment suppliers',
  'Marketing agencies and freelancers',
  'Anyone with restaurant owners in their network',
];

const steps = [
  { icon: FaHandshake, title: 'Apply', text: 'Fill in the short form below. Our team reviews every application and replies within 2–3 business days.' },
  { icon: FaCalendarCheck, title: 'Register your leads', text: 'Introduce a restaurant and register it with us within 48 hours of first contact, so it is counted as yours.' },
  { icon: FaTools, title: 'We do the rest', text: 'We run the demo, set up the menu, train the staff and support the restaurant. You do not need to install anything.' },
  { icon: FaWallet, title: 'Get paid monthly', text: '20% of what the restaurant pays (excluding taxes), every month the restaurant stays with us, with a monthly statement.' },
];

export default function PartnersClient() {
  const [market, setMarket] = useState('US');
  const [planIdx, setPlanIdx] = useState(1);
  const [count, setCount] = useState(10);
  const mk = MARKETS[market];
  const plan = mk.plans[Math.min(planIdx, mk.plans.length - 1)];
  const money = (n) => mk.sym + Number(n).toLocaleString(mk.loc, { maximumFractionDigits: mk.dec || 0 });
  const perRestaurant = plan[1] * COMMISSION;
  const perMonth = perRestaurant * count;

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.phone.trim() && !form.email.trim()) return setError('Please enter a WhatsApp number or an email so we can reach you.');
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    const comment = [
      `Restaurant: PARTNER APPLICATION — ${form.name.trim()}`,
      `Name: ${form.name.trim()}`,
      `Market: ${mk.label}`,
      form.email.trim() && form.phone.trim() && `Email: ${form.email.trim()}`,
      form.message.trim() && `Message: ${form.message.trim().slice(0, MAX_MESSAGE)}`,
    ].filter(Boolean).join('\n');
    try {
      const usePhone = !!form.phone.trim();
      await apiClient.submitDemoRequest(usePhone ? 'phone' : 'email', form.phone.trim(), form.email.trim(), comment);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Could not send your application. Please try again.');
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <>
      <CommonHeader />
      <main style={{ backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ ...section, paddingTop: '56px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            DINEOPEN PARTNER PROGRAM
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 50px)', fontWeight: 800, color: INK, lineHeight: 1.1, margin: '0 auto 18px', maxWidth: '820px' }}>
            Grow with DineOpen. Earn <span style={{ color: RED }}>20% every month</span>
          </h1>
          <p style={{ ...lede, marginBottom: '28px' }}>
            Introduce restaurants to DineOpen. We take care of the demo, setup and support. You receive 20% of their subscription every month, for as long as they stay with us.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#apply" style={{ backgroundColor: RED, color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>
              Apply to become a partner
            </a>
            <a href="#how" style={{ backgroundColor: 'white', color: INK, padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', border: `1px solid ${BORDER}` }}>
              How it works
            </a>
          </div>
        </section>

        {/* Earnings calculator (currency follows the visitor's country) */}
        <section style={{ ...section, paddingTop: 0 }}>
          <div style={{ ...card, padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label htmlFor="calc-market" style={label}>Country</label>
                <select id="calc-market" style={input} value={market} onChange={(e) => { setMarket(e.target.value); setPlanIdx(MARKETS[e.target.value].plans.length > 1 ? 1 : 0); }}>
                  {Object.entries(MARKETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="calc-plan" style={label}>Plan the restaurant picks</label>
                <select id="calc-plan" style={input} value={Math.min(planIdx, mk.plans.length - 1)} onChange={(e) => setPlanIdx(Number(e.target.value))} disabled={mk.plans.length === 1}>
                  {mk.plans.map(([n, p], i) => <option key={n} value={i}>{n} — {mk.sym}{p.toLocaleString(mk.loc)}/month</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="calc-count" style={label}>Restaurants you bring: <strong style={{ color: INK }}>{count}</strong></label>
                <input id="calc-count" type="range" min="1" max="100" value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ width: '100%', accentColor: RED }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '22px' }}>
              {[
                { big: money(perRestaurant), small: 'per restaurant, per month' },
                { big: money(perMonth), small: `per month from ${count} restaurant${count === 1 ? '' : 's'}` },
                { big: money(perMonth * 12), small: 'per year' },
              ].map((x) => (
                <div key={x.small} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px 18px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: INK, fontVariantNumeric: 'tabular-nums' }}>{x.big}</div>
                  <div style={{ fontSize: '14px', color: MUTED, marginTop: '4px' }}>{x.small}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '13px', color: MUTED, textAlign: 'center', marginTop: '14px' }}>
            Estimate only. Based on 20% of subscription revenue received, excluding taxes, refunds and free trials.
          </p>
        </section>

        {/* Partner types */}
        <section style={{ ...section, backgroundColor: 'white', maxWidth: 'none' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={h2}>Two ways to partner</h2>
            <p style={lede}>Start as a referral partner. If you also want to set up and support restaurants yourself, ask us about reseller terms.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ ...card, border: `2px solid ${RED}` }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: INK, marginBottom: '6px' }}>Referral partner</h3>
                <p style={{ color: RED, fontWeight: 700, marginBottom: '14px' }}>20% recurring, every month</p>
                {['You introduce the restaurant', 'We demo, onboard and support it', 'No technical knowledge needed', 'Monthly commission statement'].map((t) => (
                  <div key={t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', color: '#374151' }}><FaCheck style={{ color: '#16a34a', marginTop: '4px', flexShrink: 0 }} />{t}</div>
                ))}
              </div>
              <div style={card}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: INK, marginBottom: '6px' }}>Reseller partner</h3>
                <p style={{ color: MUTED, fontWeight: 700, marginBottom: '14px' }}>Terms shared after approval</p>
                {['You sell, set up and train the restaurant', 'First-line support in your local language', 'Ideal for POS and hardware dealers', 'Higher earning potential for active resellers'].map((t) => (
                  <div key={t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', color: '#374151' }}><FaCheck style={{ color: '#16a34a', marginTop: '4px', flexShrink: 0 }} />{t}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section style={section}>
          <h2 style={h2}>Who it is for</h2>
          <p style={lede}>Anyone, in any country, who already talks to restaurant owners.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {audiences.map((a) => (
              <div key={a} style={{ ...card, padding: '16px 18px', display: 'flex', gap: '10px', alignItems: 'center', color: '#374151', fontWeight: 600 }}>
                <FaCheck style={{ color: RED, flexShrink: 0 }} />{a}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" style={{ ...section, backgroundColor: 'white', maxWidth: 'none' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={h2}>How it works</h2>
            <p style={lede}>Four steps from application to your first payout.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
              {steps.map((s, i) => (
                <div key={s.title} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', color: RED, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{i + 1}</span>
                    <s.icon style={{ color: RED }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: INK, marginBottom: '6px' }}>{s.title}</h3>
                  <p style={{ fontSize: '15px', color: MUTED, lineHeight: 1.55, margin: 0 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application form */}
        <section id="apply" style={section}>
          <h2 style={h2}>Apply to become a partner</h2>
          <p style={lede}>Takes 2 minutes. We reply within 2–3 business days on WhatsApp or email.</p>
          <div style={{ ...card, maxWidth: '720px', margin: '0 auto', padding: '28px' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <FaCheckCircle size={44} style={{ color: '#16a34a', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: INK, marginBottom: '8px' }}>Application received</h3>
                <p style={{ color: MUTED, lineHeight: 1.6 }}>Thank you. Our partner team will review it and contact you within 2–3 business days.</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label htmlFor="p-name" style={label}>Your name *</label><input id="p-name" style={input} value={form.name} onChange={set('name')} autoComplete="name" /></div>
                  <div><label htmlFor="p-phone" style={label}>WhatsApp / phone</label><input id="p-phone" style={input} value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" /></div>
                  <div><label htmlFor="p-email" style={label}>Email</label><input id="p-email" type="email" style={input} value={form.email} onChange={set('email')} autoComplete="email" /></div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="p-message" style={label}>Tell us about you</label>
                    <textarea id="p-message" rows={5} maxLength={MAX_MESSAGE} style={{ ...input, resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder="Your company (if any), city/country, what you do today and how many restaurants you can reach" />
                    <div style={{ fontSize: '12px', color: MUTED, textAlign: 'right', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>{form.message.length}/{MAX_MESSAGE}</div>
                  </div>
                </div>
                {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '14px', marginTop: '14px' }}>{error}</p>}
                <button type="submit" disabled={submitting} style={{ marginTop: '20px', width: '100%', backgroundColor: RED, color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '16px', cursor: submitting ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send application'}
                </button>
                <p style={{ fontSize: '12px', color: MUTED, marginTop: '10px', textAlign: 'center' }}>
                  <FaWhatsapp style={{ verticalAlign: '-2px', color: '#16a34a' }} /> Enter a WhatsApp number or an email so we can reach you.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ ...section, backgroundColor: 'white', maxWidth: 'none' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={h2}>Partner FAQ</h2>
            <div style={{ marginTop: '28px' }}>
              {PARTNER_FAQS.map((f) => (
                <div key={f.q} style={{ borderBottom: `1px solid ${BORDER}`, padding: '18px 0' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: INK, marginBottom: '8px' }}>{f.q}</h3>
                  <p style={{ fontSize: '15px', color: MUTED, lineHeight: 1.65, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  );
}
