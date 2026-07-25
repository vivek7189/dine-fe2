'use client';

// Shared country marketing hub (used by /usa, /uk, /canada). Data-driven so each
// country page passes its own config — no triplicated markup. Anchors the country
// cluster: links to the /pos/{country} page, local verticals, guides/tools, and a
// country-specific FAQ (also emitted as FAQPage JSON-LD for AEO / AI answers).

import Link from 'next/link';
import CommonHeader from '../components/CommonHeader';
import Footer from '../components/Footer';
import { FaCheck, FaArrowRight, FaShieldAlt, FaCreditCard, FaTruck, FaStar } from 'react-icons/fa';

export default function CountryHubClient({ data }) {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (data.faqs || []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com' },
      { '@type': 'ListItem', position: 2, name: `${data.countryName} POS`, item: `https://www.dineopen.com/${data.slug}` },
    ],
  };

  const section = { maxWidth: '1120px', margin: '0 auto', padding: '0 20px' };
  const card = { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <CommonHeader />

      {/* Hero */}
      <section style={{ ...section, paddingTop: '64px', paddingBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#dc2626', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, marginBottom: '20px', border: '1px solid #fecaca' }}>
          <span style={{ fontSize: '18px' }}>{data.flag}</span> {data.hero.badge}
        </div>
        <h1 style={{ fontSize: '44px', lineHeight: 1.1, fontWeight: 900, color: '#111827', letterSpacing: '-1.5px', maxWidth: '860px', margin: '0 auto 20px' }}>
          {data.hero.h1}
        </h1>
        <p style={{ fontSize: '20px', color: '#4b5563', maxWidth: '720px', margin: '0 auto 16px', lineHeight: 1.6 }}>{data.hero.sub}</p>
        <p style={{ fontSize: '17px', fontWeight: 600, color: '#374151', maxWidth: '720px', margin: '0 auto 32px' }}>
          The modern POS built to replace <span style={{ color: '#ef4444', fontWeight: 800 }}>{data.competitors}</span> — AI ordering, zero transaction fees, no hardware lock-in.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>Start Free Trial</Link>
          <Link href={data.posLink} style={{ background: '#fff', color: '#111827', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', border: '1.5px solid #e5e7eb' }}>{data.posLinkLabel || `See ${data.countryName} POS`} &rarr;</Link>
        </div>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
          {data.stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why DineOpen for {country} — compliance / payments / delivery */}
      <section style={{ ...section, paddingBottom: '48px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '28px', letterSpacing: '-1px' }}>Built for {data.countryName} restaurants</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {[
            { icon: FaShieldAlt, title: 'Local tax & compliance', items: data.compliance },
            { icon: FaCreditCard, title: 'Payments customers use', items: data.payments },
            { icon: FaTruck, title: 'Delivery & integrations', items: data.delivery },
          ].map((col) => (
            <div key={col.title} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <col.icon color="#ef4444" size={18} />
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>{col.title}</div>
              </div>
              {col.items.map((it) => (
                <div key={it} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
                  <FaCheck color="#10b981" size={12} style={{ marginTop: '4px', flexShrink: 0 }} /> {it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section style={{ ...section, paddingBottom: '48px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>POS for every {data.countryName} venue</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
          {data.verticals.map((v) => (
            <Link key={v.name} href={v.href} style={{ ...card, padding: '18px', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{v.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{v.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular locations (rendered on country hubs; omitted on location pages) */}
      {data.locations && data.locations.length > 0 && (
        <section style={{ ...section, paddingBottom: '48px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Popular {data.countryName} locations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '14px' }}>
            {data.locations.map((l) => (
              <Link key={l.name} href={l.href} style={{ ...card, padding: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{l.name}</span>
                <FaArrowRight color="#ef4444" size={12} style={{ flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Guides & tools */}
      <section style={{ ...section, paddingBottom: '48px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>{data.countryName} guides &amp; free tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '14px' }}>
          {data.guides.map((g) => (
            <Link key={g.name} href={g.href} style={{ ...card, padding: '18px', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{g.name}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{g.desc}</div>
              </div>
              <FaArrowRight color="#ef4444" size={14} style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ (mirrors the FAQPage schema for AEO) */}
      <section style={{ ...section, paddingBottom: '56px', maxWidth: '820px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '24px' }}>{data.countryName} restaurant POS — FAQ</h2>
        {data.faqs.map((f) => (
          <div key={f.q} style={{ ...card, marginBottom: '12px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>{f.q}</div>
            <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6 }}>{f.a}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ ...section, paddingBottom: '72px' }}>
        <div style={{ background: 'linear-gradient(135deg,#111827,#374151)', borderRadius: '24px', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '4px', marginBottom: '12px' }}>{[0,1,2,3,4].map(i => <FaStar key={i} color="#fbbf24" />)}</div>
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>Switch to DineOpen in {data.countryName}</h2>
          <p style={{ fontSize: '17px', color: '#d1d5db', maxWidth: '560px', margin: '0 auto 24px' }}>Set up in minutes. No credit card, no contracts, no hardware lock-in — {data.priceLine}.</p>
          <Link href="/register" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>Start Free Trial</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
