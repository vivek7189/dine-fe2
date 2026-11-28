'use client';

// Sign-up box after a blog post, written for restaurant OWNERS: the message matches the post's
// topic (delivery fees, POS, food cost, staff, tax…) and the price matches the visitor's country
// (same prices as /pricing). Country = ?country=xx, else the browser time zone, else USD.
// Blog-only; any error just leaves the default (USD, general message).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

// Starting price per country — keep in line with src/app/pricing/PricingClient.js.
// India shows "from ₹799" (the ₹299 Café Lite is never shown publicly).
const PRICE = {
  US: '$20/month', CA: 'US$20/month', AU: 'US$20/month', GB: '£16/month', IE: 'US$20/month',
  AE: 'AED 75/month', SA: 'SAR 75/month', QA: 'US$20/month', KW: 'KWD 6/month', BH: 'BHD 8/month',
  OM: 'US$20/month', IN: '₹799/month', KE: 'US$20/month', NG: 'US$20/month', ZA: 'US$20/month', SG: 'US$20/month',
};

const TZ = {
  'Europe/London': 'GB', 'Europe/Dublin': 'IE',
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Africa/Nairobi': 'KE', 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA', 'Asia/Singapore': 'SG',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
  'America/Halifax': 'CA', 'America/Regina': 'CA', 'America/St_Johns': 'CA', 'America/Montreal': 'CA',
};

function detectCountry() {
  try {
    const q = (new URLSearchParams(window.location.search).get('country') || '').toUpperCase();
    if (PRICE[q]) return q;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (TZ[tz]) return TZ[tz];
    if (tz.startsWith('Australia/')) return 'AU';
    if (tz.startsWith('America/')) return 'US';
  } catch (_) { /* default below */ }
  return 'US';
}

// Topic from the post's slug + tags → the message an owner reading it cares about.
const TOPICS = [
  { key: 'delivery', re: /deliveroo|doordash|uber.?eats|just.?eat|skip|swiggy|zomato|talabat|commission|delivery|direct.?order|online.?order/i,
    title: 'Stop paying commission on repeat orders',
    text: 'Take orders from your own QR menu and ordering link at 0% commission, and keep delivery-app sales in the same reports.' },
  { key: 'pos', re: /\bpos\b|epos|billing|point.?of.?sale|toast|square|clover|lightspeed|petpooja|posist|software|kot|kds|kitchen.?display/i,
    title: 'Try a restaurant POS without a contract',
    text: 'Billing, KOT printing, QR ordering, inventory and reports on any tablet or phone. Set up in minutes.' },
  { key: 'cost', re: /food.?cost|menu.?pric|margin|profit|wastage|waste|inventory|recipe/i,
    title: 'See your real food cost every day',
    text: 'DineOpen deducts stock from recipes as you sell, so food cost and margins update on their own.' },
  { key: 'staff', re: /staff|labou?r|payroll|salary|attendance|shift|tip|hiring|hire/i,
    title: 'Staff, shifts and payroll in one app',
    text: 'Attendance, rotas and salary sheets next to your sales, without spreadsheets.' },
  { key: 'tax', re: /\btax|vat|gst|hst|invoice|bill/i,
    title: 'Bills with the right tax, automatically',
    text: 'Set your country tax once (VAT, GST, HST or sales tax) and every bill and report gets it right.' },
];
const STARTER = /how-to-(start|open)|cost-to-open|business-plan|kaise|license|startup/i;

export default function BlogOwnerCTA({ slug = '', tags = [] }) {
  const [country, setCountry] = useState('US');
  useEffect(() => { setCountry(detectCountry()); }, []);

  const hay = `${slug} ${(tags || []).join(' ')}`;
  const starter = STARTER.test(slug);
  const topic = TOPICS.find((t) => t.re.test(hay));
  const title = starter ? 'Opening soon, or already running a food business?' : (topic ? topic.title : 'Run your restaurant on DineOpen');
  const text = starter
    ? 'Get billing, menu, QR ordering and stock ready before day one. It takes about 5 minutes to set up.'
    : (topic ? topic.text : 'POS, QR ordering, inventory, staff and reports in one app, on any device.');
  const price = PRICE[country] || PRICE.US;
  const campaign = encodeURIComponent(slug || 'blog');
  const href = `/login?utm_source=dineopen&utm_medium=blog&utm_campaign=${campaign}`;

  return (
    <aside
      aria-label="Try DineOpen"
      style={{
        marginTop: '32px', padding: '22px 24px', borderRadius: '16px',
        border: '1px solid #fecaca', background: 'linear-gradient(135deg, #fff7f6, #ffffff)',
        display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ flex: '1 1 280px' }}>
        <div style={{ fontWeight: 800, fontSize: '19px', color: '#111827', lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: '15px', color: '#4b5563', marginTop: '6px', lineHeight: 1.55 }}>{text}</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
          7-day free trial · then from {price} · no contract
        </div>
      </div>
      <Link
        href={href}
        onClick={() => { try { posthog.capture('blog_cta_click', { slug, country, topic: starter ? 'starter' : (topic ? topic.key : 'general') }); } catch (_) { /* analytics optional */ } }}
        style={{
          backgroundColor: '#ef4444', color: '#ffffff', padding: '13px 20px', borderRadius: '10px',
          fontWeight: 700, fontSize: '15px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}
      >
        Start free trial →
      </Link>
    </aside>
  );
}
